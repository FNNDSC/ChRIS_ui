import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";

export interface TreeNodeDatum {
  id: number;
  name: string;
  parentId: number | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

export interface PaginatedTreeQueryReturn {
  // React Query states
  isLoading: boolean;
  error: unknown;
  totalCount: number;
  chunkSize: number; // for informational/debug use
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;

  // Local states
  isProcessing: boolean;
  rootNode: TreeNodeDatum | null;

  // Pagination
  fetchNextPage: () => Promise<unknown>;
  addNodeLocally: (arg: PluginInstance | PluginInstance[]) => void;
  pluginInstances: PluginInstance[];
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
    const nodeName = item.data.title || item.data.plugin_name;

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

export default function usePaginatedTreeQuery(feed?: Feed) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<PluginInstance[]>([]);

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
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { items, totalCount } = await fetchPage(
        feed!,
        pageParam,
        chunkSize,
      );
      const nextOffset = pageParam + chunkSize;
      return { items, totalCount, nextOffset };
    },
    // If nextOffset is still within the total count, we have another page
    getNextPageParam: (lastPage: { nextOffset: number; totalCount: number }) =>
      lastPage.nextOffset < lastPage.totalCount
        ? lastPage.nextOffset
        : undefined,
  });

  // Step C: References we’ll need to build our tree
  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  const rootIdRef = useRef<number | null>(null);

  // 2) Compute final pluginInstances by concatenating server items + local items
  const pluginInstances: PluginInstance[] = useMemo(() => {
    // items from the infinite query
    const serverItems =
      infiniteData?.pages.flatMap(
        (page: Partial<{ items: PluginInstance[] }>) => page.items ?? [],
      ) ?? [];

    // if plugin instance IDs are guaranteed unique,
    // just do a simple concat:
    return [...serverItems, ...localItems];
  }, [infiniteData, localItems]);

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
  /**
   * Add one or more PluginInstances as local nodes.
   *
   * If a new node's parent is already in the tree,
   * we'll insert it immutably. If there's no root or no parent, we skip it.
   *
   * This function can be called with:
   *   addNodeLocally(aSinglePluginInstance)
   * or
   *   addNodeLocally([anArray, ofPluginInstances])
   */
  const addNodeLocally = useCallback(
    (arg: PluginInstance | PluginInstance[]) => {
      // Step 1: Convert arg to an array
      const newItems = Array.isArray(arg) ? arg : [arg];

      // If there's no existing root, we can't insert children
      if (!rootNode) return;
      // We collect each item that actually gets added so we can
      // batch-update localItems once at the end
      const addedItems: PluginInstance[] = [];
      let updatedRoot = rootNode;
      // Step 2: For each PluginInstance...
      for (const newItem of newItems) {
        const parentId = newItem.data.previous_id ?? undefined;
        if (!parentId) {
          // Don't add nodes without a previous id.
          continue;
        }

        // Build the new TreeNode
        const newChild: TreeNodeDatum = {
          id: newItem.data.id,
          name:
            newItem.data.title ||
            newItem.data.plugin_name ||
            `Node ${newItem.data.id}`,
          parentId,
          item: newItem,
          children: [],
        };

        // Insert immutably
        const nextRoot = insertChildImmutable(updatedRoot, parentId, newChild);

        // If insertChildImmutable changed the structure...
        if (nextRoot !== updatedRoot) {
          updatedRoot = nextRoot;
          addedItems.push(newItem);
        }
      }

      // Step 3: If we actually changed the root, update state
      if (addedItems.length > 0) {
        setRootNode(updatedRoot);
        setLocalItems((prev) => [...prev, ...addedItems]);

        const lastAdded = addedItems[addedItems.length - 1];
        dispatch(getSelectedPlugin(lastAdded));
      }
    },
    [rootNode, dispatch],
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
    pluginInstances,
  };
}
