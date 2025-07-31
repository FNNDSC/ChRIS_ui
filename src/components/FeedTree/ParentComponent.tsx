// usePaginatedTreeQuery.ts

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type { TreeNodeDatum } from "./data";
import type { PaginatedTreeQueryReturn } from "../Feeds/usePaginatedTreeQuery";
import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { collectionJsonToJson } from "../../api/api";
import type { PluginInstance as PluginInstanceType } from "../../api/types";

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
    isProcessing,
    processingProgress,
  } = treeQuery;
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );

  const dispatch = useAppDispatch();

  const stableRootNode = useMemo(() => rootNode, [rootNode]);

  const lastPluginInstance = pluginInstances.reduce(
    (r: PluginInstance | null, x, i) => {
      if (r === null) {
        return x;
      }
      const rJson = collectionJsonToJson(r);
      const xJson = collectionJsonToJson(x);

      return rJson.id <= xJson.id ? x : r;
    },
    null,
  );

  console.info(
    "ParentComponent: pluginInstances:",
    pluginInstances,
    "lastPluginInstance:",
    lastPluginInstance,
  );

  useEffect(() => {
    if (!stableRootNode?.item || selectedPlugin || !lastPluginInstance) {
      return;
    }

    console.info(
      "ParentComponent: stableRootNode:",
      stableRootNode,
      "lastPluginInstance:",
      lastPluginInstance,
    );
    dispatch(getSelectedPlugin(lastPluginInstance));
  }, [stableRootNode, dispatch, selectedPlugin, lastPluginInstance]);

  const onNodeClick = useCallback(
    (node: TreeNodeDatum) => {
      console.info("ParentComponent: onNodeClick: node:", node.item);
      node.item && dispatch(getSelectedPlugin(node.item));
    },
    [dispatch],
  );

  if (error) {
    return <div style={{ color: "red" }}>Error: {String(error)}</div>;
  }

  // Show loading spinner only when we have no nodes at all
  if (!rootNode) {
    return (
      <SpinContainer
        title={`Constructing your feed tree (${processingProgress}% complete)`}
      />
    );
  }

  return (
    <>
      {/* Full-screen progress overlay */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "0",
            width: "100%",
            padding: "15px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            textAlign: "center",
            fontSize: "18px",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
              Processing Tree: {processingProgress}%
            </div>
            <div
              style={{
                width: "300px",
                height: "20px",
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${processingProgress}%`,
                  height: "100%",
                  backgroundColor: "#00bfff",
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>
          </div>
        </div>
      )}
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
