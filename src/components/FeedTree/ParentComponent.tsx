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
    error,
    rootNode,
    addNodeLocally,
    pluginInstances,
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

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  // Show loading spinner only when we have no nodes at all
  // This prevents spinner flickering during incremental updates
  if (!rootNode) {
    return <SpinContainer title="Contructing your feed tree" />;
  }

  return (
    <>
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
    </>
  );
};

export default ParentComponent;
