import React, { useRef } from "react";

import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { TreeNode } from "../../../api/common";
import {
  fetchComputeInfo,
  stringToColour,
} from "../CreateFeed/utils/pipelines";
import { SinglePipeline } from "../CreateFeed/types/pipeline";

export interface Point {
  x: number;
  y: number;
}

type NodeProps = {
  state: SinglePipeline;
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
  handleSetCurrentNodeTitle: (
    currentPipelineId: number,
    currentNode: number,
    title: string
  ) => void;
  handleSetPipelineEnvironments: (
    pipelineId: number,
    computeEnvData: {
      [x: number]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    }
  ) => void;
};

const setNodeTransform = (orientation: string, position: Point) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};
const DEFAULT_NODE_CIRCLE_RADIUS = 12;

const NodeData = (props: NodeProps) => {
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const {
    data,
    position,
    orientation,
    handleNodeClick,
    currentPipelineId,
    state,
    handleSetPipelineEnvironments,
  } = props;
  const { computeEnvs, title, currentNode } = state;

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

  const handleSetComputeEnvironmentsWrap = React.useCallback(
    (computeEnvData: {
      [x: number]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    }) => {
      handleSetPipelineEnvironments(currentPipelineId, computeEnvData);
    },
    [currentPipelineId, handleSetPipelineEnvironments]
  );

  React.useEffect(() => {
    async function fetchComputeEnvironments() {
      const computeEnvData = await fetchComputeInfo(data.plugin_id, data.id);
      if (computeEnvData) {
        handleSetComputeEnvironmentsWrap(computeEnvData);
      }
    }

    fetchComputeEnvironments();
  }, [data, handleSetComputeEnvironmentsWrap]);

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position]);

  const textLabel = (
    <g id={`text_${data.id}`} transform={`translate(-50,30)`}>
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
          fill: `${stringToColour(currentComputeEnv)}`,
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
