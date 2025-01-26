import type {
  Feed,
  FeedPluginInstanceList,
  PluginInstance,
} from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { useCallback, useEffect, useRef, useState } from "react";
import { SpinContainer } from "../Common";
import type { TreeNodeDatum } from "./data";
import FeedTree from "./FeedTree";
import "./FeedTree.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";

interface ParentComponentProps {
  changeLayout: () => void;
  currentLayout: boolean;
  feed?: Feed;
}

export type TSID = {
  [key: string]: number[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const { changeLayout, currentLayout, feed } = props;
  const { roots, loadMoreOldest, oldestOffset, loading } =
    usePaginatedTree(feed);
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!selectedPlugin && roots.length > 0 && roots[0].item) {
      dispatch(getSelectedPlugin(roots[0].item));
    }
  }, [dispatch, roots, selectedPlugin]);

  const onNodeClick = useCallback(
    (node: TreeNodeDatum) => {
      node.item && dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  return roots && roots.length > 0 ? (
    <>
      {/* Load More button if user wants to fetch another 50 from the oldest side */}
      {!loading && oldestOffset && oldestOffset > 0 && (
        <Button onClick={loadMoreOldest}>Load More Oldest (50)</Button>
      )}
      {loading && <SpinContainer title="loading..." />}
      <FeedTree
        data={roots}
        //@ts-ignore
        tsIds={[]}
        onNodeClick={onNodeClick}
        changeLayout={changeLayout}
        currentLayout={currentLayout}
      />
    </>
  ) : null;
};

export default ParentComponent;

/**
 * Algorithm:
 * 1) Fetch newest 20 (offset=0). We get totalCount (e.g. 900).
 * 2) Jump to oldest side: offset = totalCount - 20. Fetch 20, then offset-20, offset-20...
 *    Keep going until we've fetched 100 from that oldest side. Now we have both ends.
 * 3) Expose a 'loadMoreOldest()' if the user wants more from the oldest side, e.g. 50 at a time.
 * 4) Store both newest and oldest items in a single data structure that
 *    allows incremental parent-child linking.
 */
export function usePaginatedTree(feed: Feed | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We'll store how many total plugin instances exist
  const totalCountRef = useRef<number | null>(null);

  // We'll track how far we've fetched from the oldest side
  const oldestOffsetRef = useRef<number | null>(null);

  // We'll track how many oldest items we've integrated so far
  const integratedFromOldestRef = useRef<number>(0);

  // The main tree data structure
  const mappedArrRef = useRef(new Map<number, TreeNodeDatum>());
  const childrenMapRef = useRef(new Map<number, TreeNodeDatum[]>());
  const [roots, setRoots] = useState<TreeNodeDatum[]>([]);

  // ===============================
  //  PHASE 1 + PHASE 2 on mount
  // ===============================
  useEffect(() => {
    if (!feed) return;

    let didCancel = false;
    setLoading(true);
    setError(null);

    // Reset everything on feed change
    mappedArrRef.current.clear();
    childrenMapRef.current.clear();
    setRoots([]);
    totalCountRef.current = null;
    oldestOffsetRef.current = null;
    integratedFromOldestRef.current = 0;

    (async () => {
      try {
        //
        // 1) NEWEST 20 => offset=0
        //
        const newestList = await feed.getPluginInstances({
          limit: 20,
          offset: 0,
        });
        if (didCancel) return;

        // Integrate those items so partial linking can happen
        integrateIntoTree(
          newestList,
          mappedArrRef.current,
          childrenMapRef.current,
          roots,
        );
        setRoots([...roots]); // re-render

        // Grab totalCount
        totalCountRef.current = newestList.totalCount ?? 0;
        const totalCount = totalCountRef.current;

        // If there are ≤ 20 total, we're effectively done
        if (!totalCount || totalCount <= 20) {
          setLoading(false);
          return;
        }

        //
        // 2) OLDEST SIDE: offset= totalCount - 20 => fetch 20 repeatedly until 100 integrated
        //
        let offset = Math.max(0, totalCount - 20);
        oldestOffsetRef.current = offset;

        while (
          !didCancel &&
          integratedFromOldestRef.current < 100 &&
          offset >= 0
        ) {
          const list = await feed.getPluginInstances({ limit: 20, offset });
          if (didCancel) return;

          const fetchedCount = list.getItems()?.length ?? 0;
          integrateIntoTree(
            list,
            mappedArrRef.current,
            childrenMapRef.current,
            roots,
          );
          setRoots([...roots]); // re-render
          integratedFromOldestRef.current += fetchedCount;

          // Move offset 20 more
          offset -= 20;
          if (offset < 0) offset = 0;
          oldestOffsetRef.current = offset;
        }
      } catch (err: any) {
        if (!didCancel) {
          console.error("Error building tree:", err);
          setError(err.message ?? String(err));
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [feed]);

  // ===================================
  //  "LOAD MORE" FROM THE OLDEST SIDE
  // ===================================
  const loadMoreOldest = useCallback(async () => {
    if (!feed || loading) return;

    try {
      setLoading(true);
      setError(null);

      const totalCount = totalCountRef.current ?? 0;
      let offset = oldestOffsetRef.current ?? totalCount - 20;

      // If offset <= 0, there's nothing older to fetch
      if (offset <= 0) {
        setLoading(false);
        return;
      }

      // For each user request, we fetch 50 older items
      offset = Math.max(0, offset - 50);

      const list = await feed.getPluginInstances({ limit: 50, offset });
      integrateIntoTree(
        list,
        mappedArrRef.current,
        childrenMapRef.current,
        roots,
      );
      setRoots([...roots]);

      oldestOffsetRef.current = offset;
    } catch (err: any) {
      console.error("Error in loadMoreOldest:", err);
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [feed, loading, roots]);

  return {
    roots,
    loading,
    error,
    totalCount: totalCountRef.current,
    oldestOffset: oldestOffsetRef.current ?? null,
    integratedFromOldest: integratedFromOldestRef.current,
    loadMoreOldest,
  };
}

/**
 * Incrementally integrates a newly fetched batch into the partial tree.
 *
 * We link child <-> parent if the parent is already known; otherwise,
 * we stash the child in childrenMap until the parent arrives.
 * If a node was incorrectly in roots but now we have its parent,
 * we remove it from roots (optionally).
 */
function integrateIntoTree(
  pluginInstanceList: FeedPluginInstanceList,
  mappedArr: Map<number, TreeNodeDatum>,
  childrenMap: Map<number, TreeNodeDatum[]>,
  roots: TreeNodeDatum[],
) {
  const items: PluginInstance[] = pluginInstanceList.getItems() || [];

  for (const item of items) {
    const id = item.data.id;
    if (mappedArr.has(id)) {
      continue; // skip duplicates
    }

    const parentId = item.data.previous_id ?? null;
    const node: TreeNodeDatum = {
      id,
      name: item.data.title || item.data.plugin_name,
      parentId,
      item,
      children: [],
    };

    mappedArr.set(id, node);

    if (!parentId) {
      // If there's no parent, we consider it a root
      roots.push(node);
    } else {
      // If we already have the parent, attach now
      const parentNode = mappedArr.get(parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // Parent not yet arrived, stash child
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)!.push(node);
      }
    }

    // If some children were waiting for *this* node, attach them
    if (childrenMap.has(id)) {
      node.children.push(...childrenMap.get(id)!);
      childrenMap.delete(id);
    }
  }
}
