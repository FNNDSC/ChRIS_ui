// usePaginatedTreeQuery.ts

import type { Feed } from "@fnndsc/chrisapi";
import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type { TreeNodeDatum } from "./data";
import usePaginatedTreeQuery from "./usePaginatedTreeQuery";

interface ParentComponentProps {
  changeLayout: () => void;
  currentLayout: boolean;
  feed?: Feed;
}

const ParentComponent: React.FC<ParentComponentProps> = ({
  changeLayout,
  currentLayout,
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
  } = usePaginatedTreeQuery(feed);
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

  if (isLoading) {
    return <SpinContainer title="Loading partial feed tree..." />;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  if (!rootNode && !isProcessing && !isFetchingNextPage) {
    // No items in the feed
    return <div>No items found.</div>;
  }

  return (
    <>
      {(isProcessing || isFetchingNextPage) && (
        <SpinContainer title="Constructing the tree..." />
      )}
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
        />
      )}
    </>
  );
};

export default ParentComponent;
