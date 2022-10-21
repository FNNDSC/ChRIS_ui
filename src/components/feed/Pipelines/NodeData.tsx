import React, { useRef, useContext } from "react";
import { Types, colorPalette } from "../CreateFeed/types";
import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { TreeNode } from "../../../utils";
import { fetchComputeInfo } from "../CreateFeed/utils/pipelines";
import { CreateFeedContext } from "../CreateFeed/context";

export interface Point {
  x: number;
  y: number;
}

type NodeProps = {
  data: TreeNode;
  parent: HierarchyPointNode<TreeNode> | null;
  position: Point;
  orientation: string;
  handleNodeClick: (
    pluginName: number,
    pipelineId: number,
    plugin_id: number
  ) => void;
  currentPipelineId: number;
};

const setNodeTransform = (orientation: string, position: Point) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};
const DEFAULT_NODE_CIRCLE_RADIUS = 12;
const NodeData = (props: NodeProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);

  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const { data, position, orientation, handleNodeClick, currentPipelineId } =
    props;
  const { computeEnvs, title } = state.pipelineData[currentPipelineId];
  const { currentNode } = state.pipelineData[currentPipelineId];
  let currentComputeEnv = "";
  if (computeEnvs && computeEnvs[data.id]) {
    currentComputeEnv = computeEnvs[data.id].currentlySelected;
  }

  const titleName = title && title[data.id];

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
  };

  React.useEffect(() => {
    async function fetchComputeEnvironments() {
      const computeEnvData = await fetchComputeInfo(data.plugin_id, data.id);
      if (computeEnvData) {
        dispatch({
          type: Types.SetPipelineEnvironments,
          payload: {
            pipelineId: currentPipelineId,
            computeEnvData,
          },
        });
      }
    }

    fetchComputeEnvironments();
  }, [data, dispatch, currentPipelineId]);

  React.useEffect(() => {
    if (data.plugin_name && currentPipelineId) {
      dispatch({
        type: Types.SetCurrentNodeTitle,
        payload: {
          currentPipelineId,
          currentNode,
          title: data.plugin_name,
        },
      });
    }
  }, [currentNode, currentPipelineId, data.plugin_name, dispatch]);

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position]);

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text ref={textRef} className="label__title">
        {`${titleName ? titleName : data.plugin_name} (id: ${data.id})`}
      </text>
    </g>
  );

  return (
    <g
      style={{
        cursor: "pointer",
      }}
      id={`${data.id}`}
      ref={nodeRef}
      onClick={() => {
        if (data) handleNodeClick(data.id, currentPipelineId, data.plugin_id);
      }}
    >
      <circle
        style={{
          fill: `${
            colorPalette[currentComputeEnv]
              ? colorPalette[currentComputeEnv]
              : colorPalette["default"]
          }`,
          stroke: data.id === currentNode ? "white" : "",
          strokeWidth: data.id === currentNode ? "3px" : "",
        }}
        id={`node_${data.id}`}
        r={DEFAULT_NODE_CIRCLE_RADIUS}
      ></circle>
      {textLabel}
    </g>
  );
};

export default NodeData;
