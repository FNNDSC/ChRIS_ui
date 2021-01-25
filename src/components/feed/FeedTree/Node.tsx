import React, { Fragment } from "react";
import { HierarchyPointNode, select } from "d3";
import { Datum } from "./data";

const DEFAULT_NODE_CIRCLE_RADIUS = 15;

type NodeProps = {
  data: Datum;
  position: {
    x: number;
    y: number;
  };
  parent: HierarchyPointNode<Datum> | null;
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
    const { parent, position } = this.props;
    const nodeTransform = this.setNodeTransform(position, parent);
    this.applyNodeTransform(nodeTransform);
    
  }

  setNodeTransform(
    position: NodeProps["position"],
    parent: NodeProps["parent"],
    shouldTranslateToOrigin = false
  ) {
    return `translate(${position.x}, ${position.y})`;
  }

 
  render() {
    const { data } = this.props;
    return (
      <Fragment>
        <g
          ref={(n) => {
            this.nodeRef = n;
          }}
          transform={this.state.nodeTransform}
        >
          <circle
            id={`node_${data.id}`}
            className="node"
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
