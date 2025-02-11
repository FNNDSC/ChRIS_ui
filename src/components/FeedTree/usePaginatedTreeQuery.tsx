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

  // Pagination methods
  fetchNextPage: () => Promise<unknown>;

  // Local modifications
  addNodeLocally: (arg: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;

  // Flattened pluginInstances array
  pluginInstances: PluginInstance[];
}

// -----------------------------------------
// 1) Helpers
// -----------------------------------------

/** Fetch just the total count of plugin instances for the Feed. */
async function fetchTotalCount(feed: Feed) {
  const resp = await feed.getPluginInstances({ limit: 1 });
  return resp.totalCount ?? 0;
}

/** Fetch a page of plugin instances (offset -> offset+limit). */
async function fetchPage(
  feed: Feed,
  offset: number,
  limit: number,
): Promise<{ items: PluginInstance[]; totalCount: number }> {
  const resp = await feed.getPluginInstances({
    offset,
    limit,
    // If the backend supports an ordering param, e.g. oldest->newest:
    // ordering: "created", // or "id"
  });
  const items = resp.getItems() || [];
  const totalCount = resp.totalCount ?? 0;
  return { items, totalCount };
}

/** Decide how big each page (chunk) should be, based on totalCount. */
function getChunkSize(count: number) {
  if (count === 0) return 20;
  if (count > 100) return 100;
  if (count < 20) return count;
  return 20;
}

/**
 * Insert or update plugin instances in the finalNodesById map.
 * We assume the backend’s order is oldest->newest, so we do no local sorting.
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

    // Identify single root node if no parent
    if (!parentId) {
      if (rootIdRef.current === null) {
        rootIdRef.current = id;
      } else if (rootIdRef.current !== id) {
        console.warn(
          "Found multiple root nodes! Existing root:",
          rootIdRef.current,
          " new root candidate:",
          id,
        );
      }
    } else {
      // Insert child under the parent
      let parentNode = finalNodesById.get(parentId);
      if (!parentNode) {
        parentNode = {
          id: parentId,
          name: `Node ${parentId}`,
          parentId: undefined,
          item: {} as PluginInstance,
          children: [],
        };
        finalNodesById.set(parentId, parentNode);
      }
      if (!parentNode.children.some((child) => child.id === id)) {
        parentNode.children.push(finalNode);
      }
    }
  }
}

/** We'll batch re-renders after every BATCH_SIZE pages or if no more pages exist. */
const BATCH_SIZE = 3;

/** Insert a single child node immutably under a parent. */
function insertChildImmutable(
  root: TreeNodeDatum,
  parentId: number,
  newChild: TreeNodeDatum,
): TreeNodeDatum {
  if (root.id === parentId) {
    return {
      ...root,
      children: [...root.children, newChild],
    };
  }

  let didChange = false;
  const newChildren = root.children.map((child) => {
    const updated = insertChildImmutable(child, parentId, newChild);
    if (updated !== child) {
      didChange = true;
    }
    return updated;
  });

  if (!didChange) return root;
  return { ...root, children: newChildren };
}

/** Recursively remove a set of node IDs (and their subtrees). */
function removeManyRecursive(
  root: TreeNodeDatum,
  toRemove: Set<number>,
): TreeNodeDatum | null {
  if (toRemove.has(root.id)) {
    return null;
  }
  let changed = false;
  const newChildren: TreeNodeDatum[] = [];
  for (const child of root.children) {
    const updated = removeManyRecursive(child, toRemove);
    if (updated) {
      newChildren.push(updated);
    } else {
      changed = true;
    }
  }
  if (!changed && newChildren.length === root.children.length) {
    return root; // no change
  }
  return { ...root, children: newChildren };
}

// -----------------------------------------
// 2) usePaginatedTreeQuery
// -----------------------------------------
export default function usePaginatedTreeQuery(
  feed?: Feed,
): PaginatedTreeQueryReturn {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<PluginInstance[]>([]);

  // A) Fetch total count
  const countQuery = useQuery({
    queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
    enabled: !!feed,
    queryFn: () => (feed ? fetchTotalCount(feed) : Promise.resolve(0)),
  });
  const totalCount = countQuery.data || 0;

  // Decide chunk size
  const chunkSize = getChunkSize(totalCount);

  // B) Infinite query that fetches from offset=0 upward
  const {
    data: infiniteData,
    error: infiniteError,
    isLoading: infiniteLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    // Unique query key to store pages in the cache
    queryKey: ["instanceList", feed?.data.id],
    // Only enable if feed is defined and we have >0 total count
    enabled: !!feed && totalCount > 0,
    initialPageParam: 0, // start offset=0
    queryFn: async ({ pageParam = 0 }) => {
      const { items, totalCount } = await fetchPage(
        feed!,
        pageParam,
        chunkSize,
      );
      const nextOffset = pageParam + chunkSize;
      return { items, totalCount, nextOffset };
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextOffset < lastPage.totalCount
        ? lastPage.nextOffset
        : undefined,
  });

  // C) We'll build the tree in finalNodesByIdRef
  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  const rootIdRef = useRef<number | null>(null);

  // Flatten server items + local items
  const pluginInstances = useMemo(() => {
    const serverItems =
      infiniteData?.pages.flatMap((page) => page.items ?? []) ?? [];
    return [...serverItems, ...localItems];
  }, [infiniteData, localItems]);

  // The final tree root
  const [rootNode, setRootNode] = useState<TreeNodeDatum | null>(null);

  // For batching re-renders
  const integratedPageCount = useRef(0);
  const pagesSinceLastRenderRef = useRef(0);

  // Whether we are currently integrating new pages
  const [isProcessing, setIsProcessing] = useState(false);

  // D) Integrate new pages as they come in
  const processNewPages = useCallback(() => {
    if (!infiniteData) return;
    const { pages } = infiniteData;

    // If we haven't integrated these pages yet...
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
      const newPageCount = pages.length - integratedPageCount.current;
      integratedPageCount.current = pages.length;
      pagesSinceLastRenderRef.current += newPageCount;

      // If we've integrated BATCH_SIZE pages or there's no more pages left
      const noMorePages = !hasNextPage;
      const isBatchComplete =
        pagesSinceLastRenderRef.current >= BATCH_SIZE || noMorePages;

      if (isBatchComplete) {
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

  useEffect(() => {
    processNewPages();
  }, [processNewPages]);

  // Optionally keep fetching pages until all are loaded
  useEffect(() => {
    if (!infiniteLoading && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [infiniteLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feed) {
        queryClient.cancelQueries({
          queryKey: ["instanceList", feed.data.id],
        });
      }
    };
  }, [feed, queryClient]);

  // E) Insert a node locally
  const addNodeLocally = useCallback(
    (arg: PluginInstance | PluginInstance[]) => {
      if (!rootNode) return;
      const newItems = Array.isArray(arg) ? arg : [arg];

      const addedItems: PluginInstance[] = [];
      let updatedRoot = rootNode;

      for (const newItem of newItems) {
        const parentId = newItem.data.previous_id ?? undefined;
        // If it has no parent, it's presumably a new root-level item.
        // Here we skip it, but you could handle multiple roots differently.
        if (!parentId) continue;

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

        const nextRoot = insertChildImmutable(updatedRoot, parentId, newChild);
        if (nextRoot !== updatedRoot) {
          updatedRoot = nextRoot;
          addedItems.push(newItem);
        }
      }

      if (addedItems.length > 0) {
        setRootNode(updatedRoot);
        setLocalItems((prev) => [...prev, ...addedItems]);
        const lastAdded = addedItems[addedItems.length - 1];
        dispatch(getSelectedPlugin(lastAdded));
      }
    },
    [rootNode, dispatch],
  );

  // F) Remove multiple IDs from the local tree + localItems
  const removeNodeLocally = useCallback(
    (ids: number[]) => {
      if (!rootNode || ids.length === 0) return;
      const toRemove = new Set(ids);
      const newRoot = removeManyRecursive(rootNode, toRemove);
      setRootNode(newRoot);
      //setLocalItems((prev) => prev.filter((inst) => !toRemove.has(inst.data.id)));
    },
    [rootNode],
  );

  // Return final data
  return {
    // React Query states
    isLoading: countQuery.isLoading || infiniteLoading,
    error: countQuery.error || infiniteError,
    totalCount,
    chunkSize,
    hasNextPage,
    isFetchingNextPage,

    // Local states
    isProcessing,
    rootNode,

    // Pagination
    fetchNextPage,

    // Insert or remove nodes locally
    addNodeLocally,
    removeNodeLocally,

    // Flattened plugin instances from local + server
    pluginInstances,
  };
}
