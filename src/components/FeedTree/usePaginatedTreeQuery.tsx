import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Feed, PluginInstance } from "@fnndsc/chrisapi";

export interface TreeNodeDatum {
  id: number;
  name: string;
  parentId: number | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

// -- 1) Helpers

/**
 * Fetch just the total count of plugin instances for the Feed.
 */
async function fetchTotalCount(feed: Feed) {
  const resp = await feed.getPluginInstances({ limit: 1 });
  return resp.totalCount ?? 0;
}

/**
 * Fetch a page of plugin instances for the Feed, given offset + limit.
 */
async function fetchPage(feed: Feed, offset: number, limit: number) {
  const resp = await feed.getPluginInstances({ offset, limit });
  const items = resp.getItems() || [];
  return {
    items,
    totalCount: resp.totalCount ?? 0,
  };
}

/**
 * Decide how big each page (chunk) should be, based on totalCount.
 *
 * - If totalCount > 100, we fetch in chunks of 100.
 * - Else if totalCount < 20, fetch exactly totalCount (only one small chunk).
 * - Else use a default chunk size of 20.
 */
function getChunkSize(count: number) {
  if (count === 0) return 20;
  if (count > 100) return 100;
  if (count < 20) return count;
  return 20;
}

/**
 * Integrate a batch of PluginInstances into our "global" map of TreeNodeDatum.
 * Tracks the single root node ID in `rootIdRef`.
 */
function integrateBatchDirectSingleRoot(
  items: PluginInstance[],
  finalNodesById: Map<number, TreeNodeDatum>,
  rootIdRef: React.MutableRefObject<number | null>,
) {
  for (const item of items) {
    const id = item.data.id;
    const parentId = item.data.previous_id ?? null;

    // Generate a name for display
    const nodeName = item.data.title || item.data.plugin_name || `Node ${id}`;

    // Either update an existing node or create a new one
    let finalNode = finalNodesById.get(id);
    if (!finalNode) {
      finalNode = {
        id,
        name: nodeName,
        parentId: parentId ?? undefined,
        item,
        children: [],
      };
      finalNodesById.set(id, finalNode);
    } else {
      // Update existing node's relevant fields
      finalNode.name = nodeName;
      finalNode.parentId = parentId ?? undefined;
      finalNode.item = item;
    }

    // Identify the single root node if it has no parent
    if (!parentId) {
      if (rootIdRef.current === null) {
        rootIdRef.current = id;
      } else if (rootIdRef.current !== id) {
        console.warn(
          "Found multiple root nodes! Existing root:",
          rootIdRef.current,
          " New root candidate:",
          id,
        );
      }
    } else {
      // It's a child → link up with the parent
      let parentNode = finalNodesById.get(parentId);
      if (!parentNode) {
        // Create a placeholder if the parent wasn't already in the map
        parentNode = {
          id: parentId,
          name: `Node ${parentId}`,
          parentId: undefined,
          item: {} as PluginInstance,
          children: [],
        };
        finalNodesById.set(parentId, parentNode);
      }
      // Insert this child if not already in the parent's children array
      if (!parentNode.children.some((child) => child.id === id)) {
        parentNode.children.push(finalNode);
      }
    }
  }
}

const BATCH_SIZE = 3;

/**
 * Recursively insert `newChild` under the node that has `parentId`.
 * Returns a new root reference only if an insertion actually happens.
 */
function insertChildImmutable(
  root: TreeNodeDatum,
  parentId: number,
  newChild: TreeNodeDatum,
): TreeNodeDatum {
  // If this node is the parent:
  if (root.id === parentId) {
    return {
      ...root,
      children: [...root.children, newChild],
    };
  }

  // Otherwise, walk through children:
  let didChange = false;

  const newChildren = root.children.map((child) => {
    const updatedChild = insertChildImmutable(child, parentId, newChild);
    if (updatedChild !== child) {
      didChange = true;
    }
    return updatedChild;
  });

  if (!didChange) {
    return root; // no change
  }

  // At least one child changed => create a *new* root object
  return {
    ...root,
    children: newChildren,
  };
}

// -- 2) The main hook

/**
 * usePaginatedTreeQuery
 *
 * 1) Fetch the total count of PluginInstances.
 * 2) Fetch instances in "pages" (forward pagination):
 *    - If count > 100, use chunkSize=100,
 *      else chunkSize=20 (unless count < 20).
 *    - Start from offset=0, and fetch subsequent pages by offset += chunkSize.
 * 3) Construct a single-root tree, integrated in batches to reduce re-renders.
 */
export function usePaginatedTreeQuery(feed?: Feed) {
  const queryClient = useQueryClient();

  // Step A: Fetch the total count
  const countQuery = useQuery({
    queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
    enabled: !!feed,
    queryFn: () => (feed ? fetchTotalCount(feed) : Promise.resolve(0)),
  });
  const totalCount = countQuery.data || 0;

  // Decide our chunk size
  const chunkSize = getChunkSize(totalCount);

  // Step B: Use an infinite query for the actual items
  const {
    data: infiniteData,
    error: infiniteError,
    isLoading: infiniteLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["feedPluginInstances", feed?.data.id, chunkSize],
    enabled: !!feed && totalCount > 0,
    // Start from offset=0
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { items, totalCount } = await fetchPage(
        feed!,
        pageParam,
        chunkSize,
      );
      const nextOffset = pageParam + chunkSize;
      return { items, totalCount, nextOffset };
    },
    // If nextOffset is still within the total count, we have another page
    getNextPageParam: (lastPage) =>
      lastPage.nextOffset < lastPage.totalCount
        ? lastPage.nextOffset
        : undefined,
  });

  // Step C: References we’ll need to build our tree
  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  const rootIdRef = useRef<number | null>(null);

  // Store the built root node in local state
  const [rootNode, setRootNode] = useState<TreeNodeDatum | null>(null);

  // For batching re-renders
  const integratedPageCount = useRef(0);
  const pagesSinceLastRenderRef = useRef(0);

  // Track if we’re integrating new pages
  const [isProcessing, setIsProcessing] = useState(false);

  // Step D: Integrate new pages as they come in
  const processNewPages = useCallback(() => {
    if (!infiniteData) return;
    const { pages } = infiniteData;

    // No new pages => do nothing
    if (pages.length <= integratedPageCount.current) return;

    setIsProcessing(true);
    try {
      for (let i = integratedPageCount.current; i < pages.length; i++) {
        const { items } = pages[i];
        integrateBatchDirectSingleRoot(
          items,
          finalNodesByIdRef.current,
          rootIdRef,
        );
      }
      // How many new pages were integrated?
      const newPageCount = pages.length - integratedPageCount.current;
      integratedPageCount.current = pages.length;
      pagesSinceLastRenderRef.current += newPageCount;

      // Decide if we should re-render now or wait
      const noMorePages = !hasNextPage;
      const isBatchComplete =
        pagesSinceLastRenderRef.current >= BATCH_SIZE || noMorePages;

      if (isBatchComplete) {
        // Build our single root node, if found
        let newRoot: TreeNodeDatum | null = null;
        if (rootIdRef.current != null) {
          newRoot = finalNodesByIdRef.current.get(rootIdRef.current) || null;
        }

        setRootNode(newRoot);
        pagesSinceLastRenderRef.current = 0;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [infiniteData, hasNextPage]);

  // Whenever infiniteData changes, integrate new items
  useEffect(() => {
    processNewPages();
  }, [processNewPages]);

  // Optionally auto-fetch next pages until we have them all
  useEffect(() => {
    if (!infiniteLoading && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [infiniteLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clean up if the component unmounts
  useEffect(() => {
    return () => {
      if (feed) {
        queryClient.cancelQueries({
          queryKey: ["feedPluginInstances", feed.data.id],
        });
      }
    };
  }, [feed, queryClient]);

  // Step E: A helper to insert a node locally (e.g. after creating a new instance)
  const addNodeLocally = useCallback(
    (newItem: PluginInstance) => {
      const newChild: TreeNodeDatum = {
        id: newItem.data.id,
        name: newItem.data.title || newItem.data.plugin_name,
        parentId: newItem.data.previous_id ?? undefined,
        item: newItem,
        children: [],
      };

      // If there's no root or newChild has no parent, assume it’s a new root:
      if (!rootNode || newChild.parentId === undefined) {
        setRootNode(newChild);
        return;
      }

      const updatedRoot = insertChildImmutable(
        rootNode,
        newChild.parentId,
        newChild,
      );
      if (updatedRoot !== rootNode) {
        setRootNode(updatedRoot);
      }
    },
    [rootNode],
  );

  // Return final data + states
  return {
    // React Query states
    isLoading: countQuery.isLoading || infiniteLoading,
    error: countQuery.error || infiniteError,

    totalCount,
    chunkSize, // for informational/debug use
    hasNextPage,
    isFetchingNextPage,

    // Local states
    isProcessing,
    rootNode,

    // Pagination
    fetchNextPage,
    addNodeLocally,
  };
}
