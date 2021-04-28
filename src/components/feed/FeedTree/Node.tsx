import React, { Fragment, useRef } from "react";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { Datum, TreeNodeDatum, Point, getTsNodes } from "./data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { PluginInstanceStatusPayload } from "../../../store/feed/types";
import { useTypedSelector } from "../../../store/hooks";

type NodeProps = {
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
  } = props;
  console.log("Node",data.item?.data.id)
 
  const [hovered, setHovered] = React.useState(false);
  const selectedPlugin = useTypedSelector((state) => state.feed.selectedPlugin);
  const pluginInstanceStatus = useTypedSelector(
    (state) =>{ return state.feed.pluginInstanceStatus
    } 
  );
  const tsNodes = useTypedSelector((state) => state.feed.tsNodes);
  const mode = useTypedSelector((state) => state.feed.treeMode);

  const applyNodeTransform = (transform: string, opacity = 1) => {
    select(nodeRef.current)
      .attr("transform", transform)
      .style("opacity", opacity);
    select(textRef.current).attr("transform",`translate(-28, 28)` );
  };

  React.useEffect(() => {
    const nodeTransform = setNodeTransform(orientation, position);
    applyNodeTransform(nodeTransform);
  }, [orientation, position]);

  const handleNodeToggle = () => {
    onNodeToggle(data.__rd3t.id);
  };

  let status = "";
  let statusClass = "";
  let tsClass = "";
  if (
    data.item &&
    data.item.data.id &&
    pluginInstanceStatus &&
    pluginInstanceStatus[data.item.data.id]
  ) {
    status = pluginInstanceStatus[data.item.data.id].status;
  } else if (data.item) {
    status = data.item.data.status;
  }

  const currentId = data.item?.data.id;
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
        onMouseOver={() => {
          setHovered(!hovered);
        }}
        onMouseOut={() => {
          setHovered(!hovered);
        }}
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
              ${selectedPlugin?.data.id === currentId && `selected`}
              `}
          r={DEFAULT_NODE_CIRCLE_RADIUS}
        ></circle>
        {toggleLabel ? textLabel : hovered ? textLabel : null}
      </g>
    </Fragment>
  );
};

export default React.memo(Node);