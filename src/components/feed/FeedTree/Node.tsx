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
  className: string;
};

type NodeState = {
  transform: string;
};

export default class Node extends React.Component<NodeProps> {
  state = {
    transform: this.setTransform(this.props.position, this.props.parent, true),
  };

  setTransform(
    position: NodeProps["position"],
    parent: NodeProps["parent"],
    shouldTranslateToOrigin = false
  ) {
    return `translate(${position.x}, ${position.y})`;
  }

  render() {
    const { data, className } = this.props;
    return (
      <Fragment>
        <g className={className} transform={this.state.transform}>
          <circle
            id={`node ${data.id}`}
            r={DEFAULT_NODE_CIRCLE_RADIUS}
          ></circle>
        </g>
      </Fragment>
    );
  }
}
