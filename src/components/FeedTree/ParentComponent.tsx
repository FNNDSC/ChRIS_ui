// usePaginatedTreeQuery.ts

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type { TreeNodeDatum } from "./data";
import type { PaginatedTreeQueryReturn } from "../Feeds/usePaginatedTreeQuery";
import type { Feed } from "@fnndsc/chrisapi";

interface ParentComponentProps {
  changeLayout: () => void;
  currentLayout: boolean;
  treeQuery: PaginatedTreeQueryReturn;
  statuses: {
    [id: number]: string;
  };
  feed?: Feed;
}

const ParentComponent: React.FC<ParentComponentProps> = ({
  changeLayout,
  currentLayout,
  treeQuery,
  statuses,
  feed,
}) => {
  const {
    isLoading,
    error,
    rootNode,
    isFetchingNextPage,
    isProcessing,
    addNodeLocally,
    pluginInstances,
    totalCount,
    removeNodeLocally,
    tsIds,
  } = treeQuery;
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );

  const dispatch = useAppDispatch();

  const stableRootNode = useMemo(() => rootNode, [rootNode]);

  useEffect(() => {
    if (stableRootNode?.item && !selectedPlugin) {
      dispatch(getSelectedPlugin(stableRootNode.item));
    }
  }, [stableRootNode, dispatch, selectedPlugin]);

  const onNodeClick = useCallback(
    (node: TreeNodeDatum) => {
      node.item && dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  if (isLoading || isProcessing || isFetchingNextPage) {
    const loadedCount = pluginInstances.length;
    const total = totalCount || 0; // guard against undefined
    const progressPercent =
      total > 0 ? Math.floor((loadedCount / total) * 100) : 0;

    return (
      <SpinContainer
        title={`Loading Feed Tree... (${loadedCount}/${total})  ${progressPercent}%`}
      />
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  return (
    <>
      {rootNode && (
        <FeedTree
          data={rootNode}
          tsIds={tsIds}
          onNodeClick={onNodeClick}
          changeLayout={changeLayout}
          currentLayout={currentLayout}
          addNodeLocally={addNodeLocally}
          pluginInstances={pluginInstances}
          statuses={statuses}
          removeNodeLocally={removeNodeLocally}
          feed={feed}
        />
      )}
    </>
  );
};

export default ParentComponent;
