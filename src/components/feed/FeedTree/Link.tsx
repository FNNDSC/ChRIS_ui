import React, { Fragment } from "react";
import { linkHorizontal, linkVertical } from "d3-shape";
import { Datum } from "./data";
import { HierarchyPointNode } from "d3-hierarchy";
import { select } from "d3-selection";

export interface TreeLinkDatum {
  source: HierarchyPointNode<Datum>;
  target: HierarchyPointNode<Datum>;
}

interface LinkProps {
  linkData: TreeLinkDatum;
  key: string;
  orientation: "horizontal" | "vertical";
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
    this.applyOpacity(1, 0);
  }

  componentWillLeave(done: () => null) {
    this.applyOpacity(1, 0, done);
  }

  applyOpacity(
    opacity: number,
    transitionDuration: number,
    done = () => {
      return null;
    }
  ) {
    select(this.linkRef).style("opacity", opacity).on("end", done);
  }

  nodeRadius = 12;
  drawPath = () => {
    const { linkData, orientation } = this.props;

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

    //@ts-ignore
    if (target.data.item?.data.plugin_type === "ts") {
      if (
        target.data.item.data.previous_id !== source.data.item?.data.previous_id
      ) {
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
    } else {
      return orientation === "horizontal"
        ? `M ${sourceY} ${sourceX} L ${targetY} ${targetX}`
        : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    }
  };

  render() {
    const { linkData } = this.props;
    return (
      <Fragment>
        <path
          ref={(l) => {
            this.linkRef = l;
          }}
          className="link"
          //@ts-ignore
          d={this.drawPath()}
          style={{ ...this.state.initialStyle }}
          data-source-id={linkData.source.id}
          data-target-id={linkData.target.id}
        />
      </Fragment>
    );
  }
}

export default React.memo(Link);
