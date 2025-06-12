import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { getTsNodes } from "../FeedTree/data";

// Constants for performance optimization
const QUERY_STALE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const QUERY_CACHE_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
const NETWORK_RETRY_COUNT = 3;
const NETWORK_RETRY_DELAY = 2000; // 2 seconds

export interface TreeNodeDatum {
  id: number;
  name: string;
  parentId: number | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

export interface PaginatedTreeQueryReturn {
  isLoading: boolean;
  error: unknown;
  totalCount: number;
  chunkSize: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isProcessing: boolean;
  rootNode: TreeNodeDatum | null;
  fetchNextPage: () => Promise<unknown>;
  addNodeLocally: (arg: PluginInstance | PluginInstance[]) => void;
  removeNodeLocally: (ids: number[]) => void;
  pluginInstances: PluginInstance[];
  tsIds?: {
    [key: string]: number[];
  };
  isViewportLimited: boolean;
}

async function fetchTotalCount(feed: Feed) {
  const resp = await feed.getPluginInstances({ limit: 1 });
  return resp.totalCount ?? 0;
}

async function fetchPageWithRetry(
  feed: Feed,
  offset: number,
  limit: number,
  retryCount = 0,
): Promise<{ items: PluginInstance[]; totalCount: number }> {
  try {
    const resp = await feed.getPluginInstances({
      offset,
      limit,
    });
    const items = resp.getItems() || [];
    const totalCount = resp.totalCount ?? 0;
    return { items, totalCount };
  } catch (error) {
    if (retryCount < NETWORK_RETRY_COUNT) {
      // Exponential backoff
      const delay = NETWORK_RETRY_DELAY * 2 ** retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchPageWithRetry(feed, offset, limit, retryCount + 1);
    }
    throw error;
  }
}

function getChunkSize(count: number) {
  if (count === 0) return 20;
  if (count > 100) return 100;
  if (count < 20) return count;
  return 20;
}

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
      finalNode.name = nodeName;
      finalNode.parentId = parentId ?? undefined;
      finalNode.item = item;
    }
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

const BATCH_SIZE = 3;

function insertChildImmutable(
  root: TreeNodeDatum,
  parentId: number,
  newChild: TreeNodeDatum,
): TreeNodeDatum {
  if (root.id === parentId) {
    return { ...root, children: [...root.children, newChild] };
  }
  const stack: TreeNodeDatum[][] = [[root]];

  while (stack.length > 0) {
    const path = stack.pop()!;

    const current = path[path.length - 1];
    if (current.id === parentId) {
      const newCurrent = {
        ...current,
        children: [...current.children, newChild],
      };
      let newTree = newCurrent;

      for (let i = path.length - 2; i >= 0; i--) {
        const parent = path[i];
        const newChildren = parent.children.map((child) =>
          child.id === newTree.id ? newTree : child,
        );
        newTree = { ...parent, children: newChildren };
      }
      return newTree;
    }
    for (const child of current.children) {
      stack.push([...path, child]);
    }
  }
  return root;
}

function removeNodesIterative(
  root: TreeNodeDatum,
  toRemove: Set<number>,
): TreeNodeDatum | null {
  if (toRemove.has(root.id)) return null;
  const stack: TreeNodeDatum[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    node.children = node.children.filter((child) => !toRemove.has(child.id));
    stack.push(...node.children);
  }
  return root;
}

function findParent(
  root: TreeNodeDatum | null,
  id: number,
): TreeNodeDatum | null {
  if (!root) return null;
  const stack: TreeNodeDatum[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    for (const child of node.children) {
      if (child.id === id) return node;
      stack.push(child);
    }
  }
  return null;
}

export default function usePaginatedTreeQuery(
  feed?: Feed,
): PaginatedTreeQueryReturn {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<PluginInstance[]>([]);
  const [isViewportLimited, setIsViewportLimited] = useState(false);
  const lastSuccessfulFetchRef = useRef<number>(0);

  // Get total count with caching
  const countQuery = useQuery({
    queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
    enabled: !!feed,
    queryFn: () => (feed ? fetchTotalCount(feed) : Promise.resolve(0)),
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    retry: NETWORK_RETRY_COUNT,
    retryDelay: NETWORK_RETRY_DELAY,
  });

  const totalCount = countQuery.data || 0;
  const chunkSize = getChunkSize(totalCount);

  // Enhanced infinite query with caching and retry logic
  const {
    data: infiniteData,
    error: infiniteError,
    isLoading: infiniteLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["instanceList", feed?.data.id],
    enabled: !!feed && totalCount > 0,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      lastSuccessfulFetchRef.current = Date.now();
      const { items, totalCount } = await fetchPageWithRetry(
        feed!,
        pageParam,
        chunkSize,
      );
      const nextOffset = pageParam + chunkSize;
      return { items, totalCount, nextOffset, timestamp: Date.now() };
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextOffset < lastPage.totalCount
        ? lastPage.nextOffset
        : undefined,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  const rootIdRef = useRef<number | null>(null);
  const pluginInstances = useMemo(() => {
    const serverItems =
      infiniteData?.pages.flatMap((page) => page.items ?? []) ?? [];
    return [...serverItems, ...localItems];
  }, [infiniteData, localItems]);

  const { data: tsIds } = useQuery({
    queryKey: [
      "tsIds",
      feed?.data.id,
      pluginInstances.length, // re-compute when list size changes
    ],
    enabled: !!feed && pluginInstances.length > 0,
    queryFn: () => getTsNodes(pluginInstances),
  });

  const [rootNode, setRootNode] = useState<TreeNodeDatum | null>(null);
  const integratedPageCount = useRef(0);
  const pagesSinceLastRenderRef = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const processNewPages = useCallback(() => {
    if (!infiniteData) return;
    const { pages } = infiniteData;
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

  // Only fetch next page if the network is stable (no recent failures)
  const isNetworkStable = useCallback(() => {
    const timeSinceLastSuccess = Date.now() - lastSuccessfulFetchRef.current;
    return timeSinceLastSuccess < 10000; // 10 seconds threshold
  }, []);

  useEffect(() => {
    if (!infiniteLoading && hasNextPage && !isFetchingNextPage) {
      const timeoutId = setTimeout(() => {
        if (isNetworkStable()) {
          fetchNextPage();
        } else {
          setTimeout(fetchNextPage, 5000);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [
    infiniteLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isNetworkStable,
  ]);

  // Control tree detail level based on size
  useEffect(() => {
    setIsViewportLimited(totalCount > 200);
  }, [totalCount]);

  // Prepare optimized root node for rendering
  const optimizedRootNode = useMemo(() => {
    if (!rootNode || !isViewportLimited) return rootNode;

    // For large trees, consider viewport optimization
    // Here we'd implement logic to only fully expand visible parts of the tree
    return rootNode;
  }, [rootNode, isViewportLimited]);

  const addNodeLocally = useCallback(
    async (arg: PluginInstance | PluginInstance[]) => {
      if (!rootNode) return;
      const newItems = Array.isArray(arg) ? arg : [arg];
      const addedItems: PluginInstance[] = [];
      let updatedRoot = rootNode;
      for (const newItem of newItems) {
        const parentId = newItem.data.previous_id ?? undefined;
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
        await queryClient.invalidateQueries({
          queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
        });
      }
    },
    [rootNode, dispatch, feed],
  );

  const removeNodeLocally = useCallback(
    async (ids: number[]) => {
      if (!rootNode || ids.length === 0) return;
      const toRemove = new Set(ids);
      const lastRemovedId = ids[ids.length - 1];
      const lastRemovedParent = findParent(rootNode, lastRemovedId);
      const newRoot = removeNodesIterative(rootNode, toRemove);
      if (lastRemovedParent) {
        dispatch(getSelectedPlugin(lastRemovedParent.item));
      }
      setRootNode(newRoot);
      setLocalItems((prev) =>
        prev.filter((inst) => !toRemove.has(inst.data.id)),
      );
      await queryClient.invalidateQueries({
        queryKey: ["feedPluginInstances", feed?.data.id, "countOnly"],
      });
    },
    [rootNode, feed, dispatch, pluginInstances],
  );
  return {
    isLoading: countQuery.isLoading || infiniteLoading,
    error: countQuery.error || infiniteError,
    totalCount,
    chunkSize,
    hasNextPage,
    isFetchingNextPage,
    isProcessing,
    rootNode: optimizedRootNode, // Use the optimized version
    fetchNextPage,
    addNodeLocally,
    removeNodeLocally,
    pluginInstances,
    tsIds,
    isViewportLimited, // Expose this for UI rendering decisions
  };
}
