// usePaginatedTreeQuery.ts

import { useEffect, useCallback } from "react";
import type { Feed } from "@fnndsc/chrisapi";
import type { TreeNodeDatum } from "./data";

import { SpinContainer } from "../Common";
import { usePaginatedTreeQuery } from "./usePaginatedTreeQuery";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";

import FeedTree from "./FeedTree";

interface ParentComponentProps {
  changeLayout: () => void;
  currentLayout: boolean;
  feed: Feed;
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
  } = usePaginatedTreeQuery(feed);

  const dispatch = useAppDispatch();

  // Dispatch the first node as soon as we have at least one root
  useEffect(() => {
    if (rootNode?.item) {
      dispatch(getSelectedPlugin(rootNode?.item));
    }
  }, [dispatch, rootNode]);

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
        <span>Contructing the tree...</span>
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
        />
      )}
    </>
  );
};

export default ParentComponent;
