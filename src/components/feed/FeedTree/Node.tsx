import React, { Fragment } from "react";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { Datum, TreeNodeDatum } from "./data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { PluginInstancePayload } from "../../../store/feed/types";

const DEFAULT_NODE_CIRCLE_RADIUS = 15;

type NodeProps = {
  data: TreeNodeDatum;
  position: {
    x: number;
    y: number;
  };
  parent: HierarchyPointNode<Datum> | null;
  selectedPlugin?: PluginInstance;
  onNodeClick: (node: PluginInstance) => void;
  onNodeToggle: (nodeId: string) => void;
  orientation: "horizontal" | "vertical";
  pluginInstances: PluginInstancePayload;
};

type NodeState = {
  nodeTransform: string;
 
};

const textLayout = {
  title: {
    textAnchor: "start",
  },
};

export default class Node extends React.Component<NodeProps, NodeState> {
  nodeRef: SVGElement | null = null;
  textRef: SVGElement | null = null;
  state = {
    nodeTransform: this.setNodeTransform(
      this.props.orientation,
      this.props.position,
      this.props.parent,
      true
    ),
    initialStyle: {
      opacity: 0,
    },
  };
  componentDidMount() {
    this.commitTransform();
  }

  componentDidUpdate() {
    this.commitTransform();
  }

  applyNodeTransform(transform: string, opacity = 1, done = () => {}) {
    select(this.nodeRef).attr("transform", transform).style("opacity", opacity);
  }

  commitTransform() {
    const { parent, position, orientation } = this.props;
    const nodeTransform = this.setNodeTransform(orientation,position, parent);
    this.applyNodeTransform(nodeTransform);
  }

  setNodeTransform(
    orientation:NodeProps['orientation'],
    position: NodeProps["position"],
    parent: NodeProps["parent"],
    shouldTranslateToOrigin = false
  ) {    
     return orientation === "horizontal"
    ? `translate(${position.y},${position.x})`
    : `translate(${position.x},${position.y})`;
  }

  handleNodeToggle=()=>{
      this.props.onNodeToggle(this.props.data.__rd3t.id)
  }

  render() {
    const { data, selectedPlugin, onNodeClick, pluginInstances } = this.props;
    let statusClass: string = "";
    const { data: instances } = pluginInstances;

    let currentInstance: PluginInstance | undefined = undefined;
    if (instances) {
      currentInstance = instances.find((instance) => {
        if (data.item)
          if (instance.data.id === data?.item.data.id) {
            return instance.data.status;
          }
      });
    }

    let status: string = "scheduled";
    if (currentInstance) {
      status = currentInstance.data.status;
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
    if (status === "waitingForPrevious" || status === "scheduled") {
      statusClass = "queued";
    }

    if (status === "finishedSuccessfully") {
      statusClass = "success";
    }

    if (status === "finishedWithError" || status === "cancelled") {
      statusClass = "error";
    }

    return (
      <Fragment>
        <g
          ref={(n) => {
            this.nodeRef = n;
          }}
          transform={this.state.nodeTransform}
        >
          <circle
            onClick={() => {
              if (data.item) {
                this.handleNodeToggle();
                onNodeClick(data.item);
              }
            }}
            id={`node_${data.id}`}
            className={`node ${statusClass} 
              ${selectedPlugin?.data.id === currentId && `selected`}
              `}
            r={DEFAULT_NODE_CIRCLE_RADIUS}
          ></circle>
          <g ref={(n) => (this.textRef = n)} {...textLayout}>
            <text className="label__title">{data.name}</text>
          </g>
        </g>
      </Fragment>
    );
  }
}
