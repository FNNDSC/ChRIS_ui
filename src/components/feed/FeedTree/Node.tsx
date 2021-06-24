import React, { Fragment, useRef } from "react";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { Datum, TreeNodeDatum, Point } from "./data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { useTypedSelector } from "../../../store/hooks";

type NodeWrapperProps = {
  tsNodes?: PluginInstance[];
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<Datum> | null;
  onNodeClick: (node: PluginInstance) => void;
  onNodeClickTs: (node: PluginInstance) => void;
  onNodeToggle: (nodeId: string) => void;
  orientation: "horizontal" | "vertical";
  toggleLabel: boolean;
};

type NodeProps = NodeWrapperProps & {
  status?: string;
  currentId: boolean;
};

const DEFAULT_NODE_CIRCLE_RADIUS = 12;

const setNodeTransform = (
  orientation: "horizontal" | "vertical",
  position: Point
) => {
  return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x}, ${position.y})`;
};

const Node = (props: NodeProps) => {
  const nodeRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const {
    orientation,
    position,
    data,
    onNodeClick,
    onNodeClickTs,
    onNodeToggle,
    toggleLabel,
    status,
    currentId,
  } = props;

  const tsNodes = useTypedSelector((state) => state.tsPlugins.tsNodes);
  const mode = useTypedSelector((state) => state.tsPlugins.treeMode);
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances.data
  );

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
    select(textRef.current).attr("transform", `translate(-28, 28)`);
  };

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position]);

  const handleNodeToggle = () => {
    onNodeToggle(data.__rd3t.id);
  };

  let statusClass = "";
  let tsClass = "";

  if (
    status &&
    (status === "started" ||
      status === "scheduled" ||
      status === "registeringFiles")
  ) {
    statusClass = "active";
  }
  if (status === "waiting") {
    statusClass = "queued";
  }

  if (status === "finishedSuccessfully") {
    statusClass = "success";
  }

  if (status === "finishedWithError" || status === "cancelled") {
    statusClass = "error";
  }

  if (mode === false && tsNodes && tsNodes.length > 0) {
    if (data.item?.data.id) {
      const node = tsNodes.find((node) => node.data.id === data.item?.data.id);
      if (node) {
        tsClass = "graphSelected";
      }
    }
  }

  const previous_id = data.item?.data.previous_id;
  if (previous_id) {
    const parentNode = pluginInstances?.find(
      (node) => node.data.id === previous_id
    );

    if (
      parentNode &&
      (parentNode.data.status === "cancelled" ||
        parentNode.data.status === "finishedWithError")
    ) {
      statusClass = "notExecuted";
    }
  }

  const textLabel = (
    <g id={`text_${data.id}`}>
      <text ref={textRef} className="label__title">
        {data.item?.data.title || data.item?.data.plugin_name}
      </text>
    </g>
  );

  return (
    <Fragment>
      <g
        id={`${data.id}`}
        ref={nodeRef}
        onClick={() => {
          if (data.item) {
            handleNodeToggle();
            if (mode === false) {
              onNodeClickTs(data.item);
            } else {
              onNodeClick(data.item);
            }
          }
        }}
      >
        <circle
          id={`node_${data.id}`}
          className={`node ${statusClass} ${tsClass}
              ${currentId && `selected`}
              `}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        ></circle>
        {toggleLabel ? textLabel : null}
      </g>
    </Fragment>
  );
};

const NodeMemoed = React.memo(Node);

const NodeWrapper = (props: NodeWrapperProps) => {
  const { data } = props;
  const status = useTypedSelector((state) => {
    if (data.id && state.resource.pluginInstanceStatus[data.id]) {
      return state.resource.pluginInstanceStatus[data.id].status;
    } else return;
  });
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const currentId = selectedPlugin?.data.id === data.id;

  return (
    <NodeMemoed
      {...props}
      status={status || data.item?.data.status}
      currentId={currentId}
    />
  );
};

export default React.memo(NodeWrapper);
