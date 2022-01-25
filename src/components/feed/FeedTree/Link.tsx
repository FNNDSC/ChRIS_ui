import React, { Fragment, useEffect, useRef, useState } from "react";
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

const Link: React.FC<LinkProps> = ({ linkData, orientation }) => {
  const linkRef = useRef<SVGPathElement | null>(null);
  const [initialStyle] = useState({ opacity: 0 });
  const nodeRadius = 12;

  useEffect(() => {
    applyOpacity(1, 0);
  }, []);

  const applyOpacity = (
    opacity: number,
    transitionDuration: number,
    done = () => {
      return null;
    }
  ) => {
    select(linkRef.current).style("opacity", opacity).on("end", done);
  };

  const drawPath = () => {
    const { source, target } = linkData;

    const deltaX = target.x - source.x,
      deltaY = target.y - source.y,
      dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
      normX = deltaX / dist,
      normY = deltaY / dist,
      sourcePadding = nodeRadius,
      targetPadding = nodeRadius + 4,
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
              target: [targetY, targetX]
            })
          : linkVertical()({
              source: [sourceX, sourceY],
              target: [targetX, targetY]
            });
      }
    } else {
      return orientation === "horizontal"
        ? `M ${sourceY} ${sourceX} L ${targetY} ${targetX}`
        : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    }
  };

  return (
    <Fragment>
      <path
        ref={linkRef}
        className="link"
        //@ts-ignore
        d={() => drawPath()}
        style={{ ...initialStyle }}
        data-source-id={linkData.source.id}
        data-target-id={linkData.target.id}
      />
    </Fragment>
  );
};

export default React.memo(Link);
