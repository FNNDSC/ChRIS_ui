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

/**
 * Constants for performance optimization and network behavior
 */
const QUERY_STALE_TIME = 5 * 60 * 1000;
const QUERY_CACHE_TIME = 10 * 60 * 1000;
const NETWORK_RETRY_COUNT = 3;
const NETWORK_RETRY_DELAY = 2000;

/**
 * Tree node data structure for rendering feed tree
 */
export interface TreeNodeDatum {
  id: number;
  name: string;
  parentId: number | undefined;
  item: PluginInstance;
  children: TreeNodeDatum[];
}

/**
 * Return type for the paginated tree query hook
 */
export interface PaginatedTreeQueryReturn {
  isLoading: boolean;
  error: unknown;
  totalCount: number;
  chunkSize: number;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isProcessing: boolean;
  processingProgress: number;
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

/**
 * Fetches the total count of plugin instances for a feed
 * @param feed The feed to fetch the count for
 * @returns A promise resolving to the total count
 */
async function fetchTotalCount(feed: Feed) {
  const resp = await feed.getPluginInstances({ limit: 1 });
  return resp.totalCount ?? 0;
}

/**
 * Fetches a page of plugin instances with retry and exponential backoff
 * @param feed The feed to fetch plugin instances from
 * @param offset The offset to start fetching from
 * @param limit Maximum number of items to fetch
 * @param retryCount Current retry attempt (for internal use)
 * @returns Promise with items and total count
 */
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
      const delay = NETWORK_RETRY_DELAY * 2 ** retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchPageWithRetry(feed, offset, limit, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Determines appropriate chunk size for pagination based on total count
 * @param count Total number of items
 * @returns Optimal chunk size
 */
function getChunkSize(count: number) {
  if (count === 0) return 20;
  if (count > 100) return 100;
  if (count < 20) return count;
  return 20;
}

/**
 * Integrates a batch of plugin instances into a tree structure
 * @param items Plugin instances to integrate
 * @param finalNodesById Map of nodes by ID
 * @param rootIdRef Reference to track the root node ID
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

/**
 * Immutably inserts a child node into a tree structure
 * @param root Root node of the tree
 * @param parentId ID of the parent node
 * @param newChild Child node to insert
 * @returns New tree with child inserted
 */
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

/**
 * Removes nodes from a tree structure iteratively
 * @param root Root node of the tree
 * @param toRemove Set of node IDs to remove
 * @returns New tree with nodes removed
 */
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

/**
 * Finds the parent of a node in a tree
 * @param root Root node of the tree
 * @param id ID of the node to find the parent for
 * @returns Parent node or null if not found
 */
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

/**
 * Custom hook for fetching, rendering, and mutating a paginated tree of plugin instances
 * @param feed Feed to fetch plugin instances from
 * @returns Object with tree data, loading states, and mutation functions
 */
export default function usePaginatedTreeQuery(
  feed?: Feed,
): PaginatedTreeQueryReturn {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [localItems, setLocalItems] = useState<PluginInstance[]>([]);
  const [isViewportLimited, setIsViewportLimited] = useState(false);

  /**
   * State and references for tree building
   */
  const finalNodesByIdRef = useRef<Map<number, TreeNodeDatum>>(new Map());
  const rootIdRef = useRef<number | null>(null);
  const [rootNode, setRootNode] = useState<TreeNodeDatum | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  /**
   * DATA FETCHING
   * Retrieves plugin instances in pages and handles data loading states
   */
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

  const {
    data: infiniteData,
    error: infiniteError,
    isLoading: infiniteLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: rawFetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["instanceList", feed?.data.id],
    enabled: !!feed && totalCount > 0,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const { items, totalCount } = await fetchPageWithRetry(
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
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_CACHE_TIME,
    refetchOnWindowFocus: false,
  });

  const fetchNextPage = useCallback(() => {
    return rawFetchNextPage({ cancelRefetch: false });
  }, [rawFetchNextPage]);

  type PageType = {
    items: PluginInstance[];
    totalCount: number;
    nextOffset: number;
  };

  const pluginInstances = useMemo(() => {
    const serverItems = infiniteData?.pages
      ? infiniteData.pages.flatMap((page) => (page as PageType).items ?? [])
      : [];
    return [...serverItems, ...localItems];
  }, [infiniteData, localItems]);

  const { data: tsIds } = useQuery({
    queryKey: ["tsIds", feed?.data.id, pluginInstances.length],
    enabled: !!feed && pluginInstances.length > 0,
    queryFn: () => getTsNodes(pluginInstances),
  });

  useEffect(() => {
    if (!infiniteLoading && hasNextPage && !isFetchingNextPage) {
      const timeoutId = setTimeout(() => {
        fetchNextPage();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [infiniteLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!infiniteData?.pages || !totalCount) return;

    const pagesLoaded = infiniteData.pages.length;
    const totalPagesNeeded = Math.ceil(totalCount / chunkSize);
    const newProgress = Math.min(
      100,
      Math.round((pagesLoaded / totalPagesNeeded) * 100),
    );

    setProcessingProgress(newProgress);
  }, [infiniteData?.pages, totalCount, chunkSize]);

  /**
   * TREE RENDERING
   * Processes fetched data into tree structure and optimizes for viewport
   */
  useEffect(() => {
    if (!infiniteData?.pages || infiniteData.pages.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      if (infiniteData.pages.length === 1) {
        finalNodesByIdRef.current = new Map();
        rootIdRef.current = null;
      }

      // Calculate total items for progress tracking
      const totalItems = infiniteData.pages.reduce(
        (total, page) => total + ((page as PageType).items?.length || 0),
        0,
      );
      let processedItems = 0;

      // Process pages one by one with progress updates
      for (let i = 0; i < infiniteData.pages.length; i++) {
        const page = infiniteData.pages[i];
        const typedPage = page as PageType;
        const pageItems = typedPage.items;

        integrateBatchDirectSingleRoot(
          pageItems,
          finalNodesByIdRef.current,
          rootIdRef,
        );

        // Update progress and set root node as soon as it's available
        processedItems += pageItems.length;
        const progress = Math.round((processedItems / totalItems) * 100);
        setProcessingProgress(progress);

        // Set root node early if it's available
        if (rootIdRef.current != null) {
          const currentRoot =
            finalNodesByIdRef.current.get(rootIdRef.current) || null;
          setRootNode(currentRoot);
        }
      }
    } finally {
      setProcessingProgress(100);
      setIsProcessing(false);
    }
  }, [infiniteData]);

  useEffect(() => {
    setIsViewportLimited(totalCount > 200);
  }, [totalCount]);

  const optimizedRootNode = useMemo(() => {
    if (!rootNode || !isViewportLimited) return rootNode;
    return rootNode;
  }, [rootNode, isViewportLimited]);

  /**
   * MUTATION HANDLERS
   * Functions for optimistically adding and removing nodes locally
   */
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
    [rootNode, dispatch, feed, queryClient],
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
    [rootNode, feed, dispatch, queryClient],
  );

  return {
    isLoading: countQuery.isLoading || infiniteLoading,
    error: countQuery.error || infiniteError,
    totalCount,
    chunkSize,
    hasNextPage,
    isFetchingNextPage,
    isProcessing,
    processingProgress,
    rootNode: optimizedRootNode,
    fetchNextPage,
    addNodeLocally,
    removeNodeLocally,
    pluginInstances,
    tsIds,
    isViewportLimited,
  };
}
