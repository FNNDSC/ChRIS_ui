import type { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";
import { linkHorizontal, linkVertical } from "d3-shape";
import React, { Fragment } from "react";
import type { TreeNodeDatum } from "./data";

export interface TreeLinkDatum {
  source: HierarchyPointNode<TreeNodeDatum>;
  target: HierarchyPointNode<TreeNodeDatum>;
}

interface LinkProps {
  linkData: TreeLinkDatum;
  key: string;
  orientation: "horizontal" | "vertical";
  isDarkTheme: boolean;
}

type LinkState = {
  initialStyle: { opacity: number };
};

class Link extends React.Component<LinkProps, LinkState> {
  private linkRef: SVGPathElement | null = null;
  state = {
    initialStyle: {
      opacity: 0,
    },
  };

  componentDidMount() {
    this.applyOpacity(1);
  }

  componentWillLeave(done: () => null) {
    this.applyOpacity(1, done);
  }

  applyOpacity(
    opacity: number,

    done = () => {
      return null;
    },
  ) {
    select(this.linkRef).style("opacity", opacity).on("end", done);
  }

  nodeRadius = 12;

  drawPath = (ts: boolean) => {
    const { linkData, orientation } = this.props;

    const { source, target } = linkData;

    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    const sourcePadding = this.nodeRadius;
    const targetPadding = this.nodeRadius + 4;
    const sourceX = source.x + sourcePadding * normX;
    const sourceY = source.y + sourcePadding * normY;
    const targetX = target.x - targetPadding * normX;
    const targetY = target.y - targetPadding * normY;

    if (ts) {
      return orientation === "horizontal"
        ? linkHorizontal()({
            source: [sourceY, sourceX],
            target: [targetY, targetX],
          })
        : linkVertical()({
            source: [sourceX, sourceY],
            target: [targetX, targetY],
          });
    }
    return orientation === "horizontal"
      ? `M${sourceY} ${sourceX} L${targetY} ${targetX}`
      : `M${sourceX} ${sourceY} L${targetX} ${targetY}`;
  };

  render() {
    const { linkData, isDarkTheme } = this.props;
    const { target } = linkData;

    const ts = target.data.item?.data?.plugin_type === "ts";

    const strokeWidthColor = isDarkTheme ? "#F2F9F9" : "#6A6E73";

    return (
      <Fragment>
        <path
          ref={(l) => {
            this.linkRef = l;
          }}
          className={`link ${ts ? "ts" : ""}`}
          //@ts-ignore
          d={this.drawPath(ts)}
          style={{ ...this.state.initialStyle, stroke: strokeWidthColor }}
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
        />
      </Fragment>
    );
  }
}

export default React.memo(Link);
