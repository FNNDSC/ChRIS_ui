import { useQuery } from "@tanstack/react-query";
import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import React, { useContext, useEffect, useRef } from "react";
import { TreeNode, fetchComputeInfo } from "../../api/common";
import { stringToColour } from "../CreateFeed/utils";
import { ThemeContext } from "../DarkTheme/useTheme";
import { PipelineContext, Types, type ComputeInfoPayload } from "./context";

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
    plugin_id: number,
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
  const { state, dispatch } = useContext(PipelineContext);
  const { computeInfo, currentlyActiveNode, selectedPipeline, titleInfo } =
    state;
  const { data, position, orientation, currentPipelineId } = props;
  const { isDarkTheme } = useContext(ThemeContext);
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  let title: string | undefined = "";

  const activeNode = currentlyActiveNode?.[currentPipelineId];

  if (activeNode) {
    title = titleInfo?.[currentPipelineId]?.[data.id];
  }

  let currentComputeEnv = "";
  if (computeInfo?.[currentPipelineId]?.[data.id]) {
    currentComputeEnv =
      computeInfo[currentPipelineId][data.id].currentlySelected;
  }

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
    select(textRef.current).attr("transform", "translate(-30, 30)");
  };

  const computeId = data.previous_id
    ? data.id -
      (selectedPipeline?.[currentPipelineId]?.pluginPipings?.[0]?.data?.id || 0)
    : 0;

  useEffect(() => {
    if (!currentlyActiveNode?.[currentPipelineId] && !data.previous_id) {
      dispatch({
        type: Types.SetCurrentlyActiveNode,
        payload: {
          pipelineId: currentPipelineId,
          nodeId: data.id,
        },
      });
    }
  }, [currentPipelineId, currentlyActiveNode?.[currentPipelineId]]);

  async function fetchComputeDataForNode() {
    try {
      const computeEnvPayload: ComputeInfoPayload | undefined =
        await fetchComputeInfo(data.plugin_id, `${data.id}`);

      if (computeEnvPayload) {
        dispatch({
          type: Types.SetComputeInfo,
          payload: {
            pipelineId: currentPipelineId,
            computeEnvPayload,
          },
        });
      }

      return computeEnvPayload;
    } catch (e) {
      throw new Error("Could not fetch compute environement for this node");
    }
  }

  const { isLoading, isError, error } = useQuery({
    queryKey: [`plugin_${data.id}`],
    queryFn: () => fetchComputeDataForNode(),
    refetchOnMount: "always",
  });

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position, applyNodeTransform]);

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text
        style={{
          fill: isDarkTheme ? "white" : "black",
        }}
        ref={textRef}
        className="label__title"
      >
        {computeId}:{title ? title : data.title}
      </text>
    </g>
  );

  const strokeColor = isDarkTheme ? "white" : "#F0AB00";

  return (
    <>
      {isError && <span>{error.message}</span>}
      {isLoading && (
        <span>Fetching the compute environments for this node...</span>
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <g
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          dispatch({
            type: Types.SetCurrentlyActiveNode,
            payload: {
              pipelineId: currentPipelineId,
              nodeId: data.id,
            },
          });
        }}
      >
        <circle
          style={{
            fill: stringToColour(currentComputeEnv),
            stroke: activeNode
              ? data.id === +activeNode
                ? strokeColor
                : ""
              : "",
            strokeWidth: activeNode
              ? data.id === +activeNode
                ? "3px"
                : ""
              : "",
          }}
          id={`node_${data.id}`}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        />
        {textLabel}
      </g>
    </>
  );
};

export default NodeData;
