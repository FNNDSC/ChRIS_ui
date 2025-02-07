// usePaginatedTreeQuery.ts

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type { TreeNodeDatum } from "./data";
import type { PaginatedTreeQueryReturn } from "./usePaginatedTreeQuery";

interface ParentComponentProps {
  changeLayout: () => void;
  currentLayout: boolean;
  treeQuery: PaginatedTreeQueryReturn;
  statuses: {
    [id: number]: string;
  };
}

const ParentComponent: React.FC<ParentComponentProps> = ({
  changeLayout,
  currentLayout,
  treeQuery,
  statuses,
}) => {
  const {
    isLoading,
    error,
    rootNode,
    isFetchingNextPage,
    isProcessing,
    addNodeLocally,
    pluginInstances,
  } = treeQuery;
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );

  const dispatch = useAppDispatch();

  // Memoize rootNode to prevent unnecessary effect runs
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
    return <SpinContainer title="Loading partial feed tree..." />;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  return (
    <>
      {rootNode && (
        <FeedTree
          data={rootNode}
          // @ts-ignore
          tsIds={[]}
          onNodeClick={onNodeClick}
          changeLayout={changeLayout}
          currentLayout={currentLayout}
          addNodeLocally={addNodeLocally}
          pluginInstances={pluginInstances}
          statuses={statuses}
        />
      )}
    </>
  );
};

export default ParentComponent;
