import { Pipeline } from "@fnndsc/chrisapi";
import { hierarchy, tree } from "d3-hierarchy";
import { event, select } from "d3-selection";
import { linkVertical } from "d3-shape";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TreeNode, getFeedTree } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import {
  getTsNodesWithPipings,
  type Point,
  type Separation,
} from "../FeedTree/data";
import useSize from "../FeedTree/useSize";
import NodeData from "./NodeData";
import { PipelineContext } from "./context";

const nodeSize = { x: 200, y: 80 };
const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";
const scale = 1;

export interface TreeProps {
  translate?: Point;
  scaleExtent: {
    min: number;
    max: number;
  };
  zoom?: number;
  nodeSize?: {
    x: number;
    y: number;
  };
  separation?: Separation;
  orientation?: "horizontal" | "vertical";
  currentPipeline: Pipeline;
}

const Tree = (props: TreeProps) => {
  const { currentPipeline } = props;
  const { state } = React.useContext(PipelineContext);
  const { selectedPipeline } = state;
  const divRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<SVGGElement>(null);
  const [translate, setTranslate] = React.useState({
    x: 0,
    y: 0,
  });
  const size = useSize(divRef);
  //const graphSize = useSize(graphRef);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<TreeNode[]>();
  const [tsIds, setTsIds] = React.useState<any>();
  const { zoom, scaleExtent } = props;
  const bindZoomListener = React.useCallback(() => {
    const svg = select(`.${svgClassName}`);
    const g = select(`.${graphClassName}`);

    svg.call(
      ///@ts-ignore
      d3Zoom().transform,
      ///@ts-ignore
      zoomIdentity
        .translate(translate.x, translate.y)
        .scale(zoom),
    );

    svg.call(
      //@ts-ignore
      d3Zoom()
        .scaleExtent([scaleExtent.min, scaleExtent.max])
        .on("zoom", () => {
          g.attr("transform", event.transform);
        }),
    );
  }, [zoom, scaleExtent, translate.x, translate.y]);

  React.useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  React.useEffect(() => {
    if (selectedPipeline) {
      const { pluginPipings, parameters } =
        selectedPipeline[currentPipeline.data.id];
      setLoading(true);
      const tree = getFeedTree(pluginPipings);
      getTsNodesWithPipings(pluginPipings, parameters).then((tsIds) => {
        setTsIds(tsIds);
      });
      setData(tree);
      setLoading(false);
    }
  }, [selectedPipeline?.[currentPipeline.data.id]]);

  React.useEffect(() => {
    //@ts-ignore
    if (size?.width) {
      setTranslate({
        //@ts-ignore
        x: size.width / 2.5,
        //@ts-ignore
        y: size.height / 6.5,
      });
    }
  }, [size]);

  React.useEffect(() => {
    const updateHeight = () => {
      if (graphRef.current && divRef.current) {
        const rect = graphRef.current.getBoundingClientRect();
        if (rect) {
          const height = rect.height;
          divRef.current.style.height = `${height + 50}px`;
        }
      }
    };

    // Run the update on mount
    updateHeight();
  }, [graphRef.current, divRef.current]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes;
    let links: any[] = [];
    let newLinks: any[] = [];
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
      const newLinksToAdd: any[] = [];

      if (tsIds) {
        for (const link of links) {
          const targetId = link.target.data.id;
          const sourceId = link.target.data.id;

          if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
            // tsPlugin found
            let topologicalLink: any;

            if (tsIds[targetId]) {
              topologicalLink = link.target;
            } else {
              topologicalLink = link.source;
            }

            const parents = tsIds[topologicalLink.data.id];
            const dict: any = {};

            for (const link of links) {
              for (let i = 0; i < parents.length; i++) {
                if (
                  link.source.data.id === parents[i] &&
                  !dict[link.source.data.id]
                ) {
                  dict[link.source.data.id] = link.source;
                } else if (
                  link.target.data.id === parents[i] &&
                  !dict[link.target.data.id]
                ) {
                  dict[link.target.data.id] = link.target;
                }
              }
            }

            for (const i in dict) {
              newLinksToAdd.push({
                source: dict[i],
                target: topologicalLink,
              });
            }
          }
        }
      }
      newLinks = [...links, ...newLinksToAdd];
    }
    return { nodes, newLinks: newLinks };
  };

  const { nodes, newLinks: links } = generateTree();

  return (
    <>
      <div ref={divRef} className="feed-tree grabbable mode_tree">
        {loading ? (
          <SpinContainer title="Constructing the tree..." />
        ) : translate.x > 0 && translate.y > 0 ? (
          <svg
            focusable="true"
            className={`${svgClassName}`}
            height="100%"
            width="100%"
          >
            <title>Pipeline Tree</title>
            <TransitionGroupWrapper
              ref={graphRef}
              component="g"
              className={graphClassName}
              transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
            >
              {links?.map((linkData, i) => {
                return (
                  <LinkData
                    orientation="vertical"
                    key={`link${i}`}
                    linkData={linkData}
                  />
                );
              })}
              {nodes?.map(({ data, x, y, parent }, i) => {
                return (
                  <NodeData
                    key={`node + ${i}`}
                    data={data}
                    position={{ x, y }}
                    parent={parent}
                    orientation="vertical"
                    currentPipelineId={currentPipeline.data.id}
                  />
                );
              })}
            </TransitionGroupWrapper>
          </svg>
        ) : (
          <EmptyStateComponent />
        )}
      </div>
    </>
  );
};

Tree.defaultProps = {
  orientation: "vertical",
  scaleExtent: { min: 0.1, max: 1 },
  zoom: 1,
  nodeSize: { x: 120, y: 80 },
};

interface LinkProps {
  linkData: any;
  key: string;
  orientation: "vertical";
}

type LinkState = {
  initialStyle: {
    opacity: number;
  };
};

const LinkData: React.FC<LinkProps> = ({ linkData }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const linkRef = useRef<SVGPathElement | null>(null);
  const [initialStyle] = useState<LinkState["initialStyle"]>({ opacity: 1 });
  const nodeRadius = 12;

  useEffect(() => {
    applyOpacity(1);
  }, []);

  const applyOpacity = (
    opacity: number,
    done = () => {
      return null;
    },
  ) => {
    select(linkRef.current).style("opacity", opacity).on("end", done);
  };

  const { source, target } = linkData;

  const drawPath = (ts: boolean) => {
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    const sourcePadding = nodeRadius;
    const targetPadding = nodeRadius + 4;
    const sourceX = source.x + sourcePadding * normX;
    const sourceY = source.y + sourcePadding * normY;
    const targetX = target.x - targetPadding * normX;
    const targetY = target.y - targetPadding * normY;

    if (ts) {
      return linkVertical()({
        source: [sourceX, sourceY],
        target: [targetX, targetY],
      });
    }
    return `M${sourceX} ${sourceY} L${targetX} ${targetY}`;
  };

  const ts = target.data.plugin_name === "pl-topologicalcopy";

  const strokeWidthColor = isDarkTheme ? "#F2F9F9" : "#6A6E73";

  return (
    <Fragment>
      <path
        ref={linkRef}
        className={`link ${ts ? "ts" : ""}`}
        //@ts-ignore
        d={drawPath(ts)}
        style={{ ...initialStyle, stroke: strokeWidthColor }}
        data-source-id={linkData.source.id}
        data-target-id={linkData.target.id}
      />
    </Fragment>
  );
};

export default Tree;
