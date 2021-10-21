import React, { useRef, useContext, Fragment } from "react";
import { Types } from "../CreateFeed/types";
import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { TreeNode } from "../../../store/workflows/types";
import { fetchComputeInfo } from "../CreateFeed/utils/pipelines";
import { CreateFeedContext } from "../CreateFeed/context";
import ChrisAPIClient from "../../../api/chrisapiclient";

const colorPalette: {
  [key: string]: string;
} = {
  default: "#5998C5",
  host: "#5998C5",
  moc: "#704478",
  titan: "#1B9D92",
  "bu-21-9": "#ADF17F",
};

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
const DEFAULT_NODE_CIRCLE_RADIUS = 10;
const NodeData = (props: NodeProps) => {
  const { state, dispatch } = useContext(CreateFeedContext);

  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const { data, position, orientation, handleNodeClick, currentPipelineId } =
    props;
  const [pluginName, setPluginName] = React.useState("");
  const { computeEnvs } = state.pipelineData[currentPipelineId];
  let currentComputeEnv = "";
  if (pluginName && computeEnvs && computeEnvs[data.id]) {
    currentComputeEnv = computeEnvs[data.id].currentlySelected;
  }

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
  };

  React.useEffect(() => {
    async function fetchComputeEnvironments() {
      if (!data.previous_id) {
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
    }

    fetchComputeEnvironments();
  }, [data, dispatch, currentPipelineId]);

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);

    async function fetchPluginName() {
      const plugin_id = data.plugin_id;
      const client = ChrisAPIClient.getClient();
      const plugin = await client.getPlugin(plugin_id);
      setPluginName(plugin.data.name);
    }

    fetchPluginName();
  }, [orientation, position, data]);

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text ref={textRef} className="label__title">
        {pluginName}
      </text>
    </g>
  );

  return (
    <Fragment>
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
          }}
          id={`node_${data.id}`}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        ></circle>
        {textLabel}
      </g>
    </Fragment>
  );
};

export default NodeData;
