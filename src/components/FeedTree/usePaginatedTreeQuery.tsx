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

async function fetchTotalCount(feed: Feed) {
  const resp = await feed.getPluginInstances({ limit: 1 });
  return resp.totalCount ?? 0;
}

async function fetchPage(feed: Feed, offset: number, limit: number) {
  const resp = await feed.getPluginInstances({ offset, limit });
  const items = resp.getItems() || [];
  return {
    items,
    totalCount: resp.totalCount ?? 0,
  };
}

function getChunkSize(count: number) {
  if (count === 0) return 20;
  if (count > 100) return 100;
  if (count < 20) return count;
  return 20;
}

/**
 * Integrate a batch of items into our "global" Map of TreeNodeDatum.
 * Use `rootIdRef` to track the one and only root ID.
 */
function integrateBatchDirectSingleRoot(
  items: PluginInstance[],
  finalNodesById: Map<number, TreeNodeDatum>,
  rootIdRef: React.MutableRefObject<number | null>,
) {
  for (const item of items) {
    const id = item.data.id;
    const parentId = item.data.previous_id ?? null;
    const nodeName = item.data.title || item.data.plugin_name || `Node ${id}`;

    // Check if we already have a final node
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
      // Update existing node
      finalNode.name = nodeName;
      finalNode.parentId = parentId ?? undefined;
      finalNode.item = item;
    }

    // If no parent, this is the ONE root
    if (!parentId) {
      // If we haven't discovered a root yet, set it
      if (rootIdRef.current === null) {
        rootIdRef.current = id;
      } else if (rootIdRef.current !== id) {
        // In a proper ChRIS feed, this shouldn't happen, but we can warn if it does
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
        // Create a placeholder
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

const BATCH_SIZE = 3; // or 3, 5, etc. if you'd like fewer re-renders
export function usePaginatedTreeQuery(feed?: Feed) {
  const queryClient = useQueryClient();
  // 1) Query to get totalCount
  const countQuery = useQuery({
    queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
    enabled: !!feed,
    queryFn: () => (feed ? fetchTotalCount(feed) : Promise.resolve(0)),
  });
  const totalCount = countQuery.data || 0;
  const chunkSize = getChunkSize(totalCount);

  // 2) Use infinite query to fetch from newest → oldest
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
    initialPageParam: Math.max(0, totalCount - chunkSize),
    queryFn: async ({ pageParam }) => {
      const { items } = await fetchPage(feed!, pageParam, chunkSize);
      const nextOffset = pageParam - chunkSize;
      return { items, nextOffset };
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextOffset >= 0 ? lastPage.nextOffset : undefined,
  });

  // 3) Final references
  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  // Single root ID instead of a Set:
  const rootIdRef = useRef<number | null>(null);

  // We'll store the "root node" in state so we can re-render
  const [rootNode, setRootNode] = useState<TreeNodeDatum | null>(null);

  // For batching re-renders
  const integratedPageCount = useRef(0);
  const pagesSinceLastRenderRef = useRef(0);

  const [isProcessing, setIsProcessing] = useState(false);

  // 4) Integrate new pages in a batch
  const processNewPages = useCallback(() => {
    if (!infiniteData) return;
    const { pages } = infiniteData;

    // No new pages => do nothing
    if (pages.length <= integratedPageCount.current) return;

    setIsProcessing(true);

    try {
      // Integrate each newly arrived page
      for (let i = integratedPageCount.current; i < pages.length; i++) {
        const { items } = pages[i];
        integrateBatchDirectSingleRoot(
          items,
          finalNodesByIdRef.current,
          rootIdRef,
        );
      }

      // Count how many new pages we integrated
      const newPageCount = pages.length - integratedPageCount.current;
      integratedPageCount.current = pages.length;
      pagesSinceLastRenderRef.current += newPageCount;

      const noMorePages = !hasNextPage;
      const isBatchComplete =
        pagesSinceLastRenderRef.current >= BATCH_SIZE || noMorePages;

      if (isBatchComplete) {
        // Build the single root node (if we have found it yet)
        let newRoot: TreeNodeDatum | null = null;
        if (rootIdRef.current != null) {
          newRoot = finalNodesByIdRef.current.get(rootIdRef.current) || null;
        }

        setRootNode(newRoot);

        // Reset batch counter
        pagesSinceLastRenderRef.current = 0;
      }
    } finally {
      setIsProcessing(false);
    }
  }, [infiniteData, hasNextPage]);

  // Whenever `infiniteData` changes, try to integrate
  useEffect(() => {
    processNewPages();
  }, [processNewPages]);

  // Optionally auto-fetch next pages until done
  useEffect(() => {
    if (!infiniteLoading && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [infiniteLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clean up if the component unmounts
  useEffect(() => {
    return () => {
      if (feed) {
        // Cancel any queries matching this key
        queryClient.cancelQueries({
          queryKey: ["feedPluginInstances", feed.data.id],
        });
      }
    };
  }, [feed, queryClient]);

  const addNodeLocally = useCallback(
    (newItem: PluginInstance) => {
      // Convert the newItem into a TreeNodeDatum
      const newChild: TreeNodeDatum = {
        id: newItem.data.id,
        name: newItem.data.title || newItem.data.plugin_name,
        parentId: newItem.data.previous_id ?? undefined,
        item: newItem,
        children: [],
      };

      // If there's no root node or no parent ID, do nothing or handle root logic
      if (!rootNode || newChild.parentId === undefined) {
        // If it's truly a brand-new root, you might do something else:
        setRootNode(newChild);
        return;
      }

      // 1) Insert the child immutably
      const updatedRoot = insertChildImmutable(
        rootNode,
        newChild.parentId,
        newChild,
      );

      // 2) If "updatedRoot" is the same reference, the parent wasn't found or no change was made
      if (updatedRoot !== rootNode) {
        setRootNode(updatedRoot);
      }
    },
    [rootNode],
  );

  // 5) Return your data & states
  return {
    // React Query states
    isLoading: countQuery.isLoading || infiniteLoading,
    error: countQuery.error || infiniteError,
    totalCount,
    chunkSize,

    // Local states
    isProcessing,
    rootNode,

    // Pagination controls
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    addNodeLocally,
  };
}

/**
 * Recursively inserts `newChild` under the node that has `parentId`.
 * Returns a new root reference only if an insertion actually happens.
 * Otherwise, returns the original root reference unchanged.
 */
function insertChildImmutable(
  root: TreeNodeDatum,
  parentId: number,
  newChild: TreeNodeDatum,
): TreeNodeDatum {
  // If this node is the parent:
  if (root.id === parentId) {
    // Return a *new* object with the child's array extended
    return {
      ...root,
      children: [...root.children, newChild],
    };
  }

  // Otherwise, recursively check this node's children
  let didChange = false;

  // We walk through root.children, building a newChildren array
  // only if something changes
  const newChildren = root.children.map((child) => {
    const updatedChild = insertChildImmutable(child, parentId, newChild);
    // If "updatedChild" is not the same reference as "child",
    // it means the insert happened in that subtree
    if (updatedChild !== child) {
      didChange = true;
    }
    return updatedChild;
  });

  // If none of the children changed, return the same "root" reference
  // so React sees no change at this level
  if (!didChange) {
    return root;
  }

  // At least one child changed => create a *new* object for this node,
  // reusing the updated children array
  return {
    ...root,
    children: newChildren,
  };
}
