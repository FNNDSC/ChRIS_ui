import React, { Fragment } from "react";
import { Datum } from "./data";
import { HierarchyPointNode } from "d3";


export interface TreeLinkDatum {
  source: HierarchyPointNode<Datum>;
  target: HierarchyPointNode<Datum>;
}

interface LinkProps {
  linkData: TreeLinkDatum;
  key: string;
}

export default class Link extends React.Component<LinkProps> {
  nodeRadius = 12;
  drawPath = () => {
    const { linkData } = this.props;
    const { source, target } = linkData;
    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = this.nodeRadius,
      targetPadding = this.nodeRadius + 4,
      sourceX = source.x + sourcePadding * normX,
      sourceY = source.y + sourcePadding * normY,
      targetX = target.x - targetPadding * normX,
      targetY = target.y - targetPadding * normY;
    return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  };

  render() {
    return (
      <Fragment>
        <path className="link" d={this.drawPath()} />
      </Fragment>
    );
  
  }
}
