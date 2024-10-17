import type { Pipeline } from "@fnndsc/chrisapi";
import {
  type HierarchyPointLink,
  type HierarchyPointNode,
  hierarchy,
  tree,
} from "d3-hierarchy";
import { type Selection, select } from "d3-selection";
import { linkVertical } from "d3-shape";
import { type ZoomBehavior, zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type TreeNode, getFeedTree } from "../../api/common";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { ThemeContext } from "../DarkTheme/useTheme";
import TransitionGroupWrapper from "../FeedTree/TransitionGroupWrapper";
import {
  type Point,
  type Separation,
  getTsNodesWithPipings,
} from "../FeedTree/data";
import useSize from "../FeedTree/useSize";
import NodeData from "./NodeData";
import SelectAllCompute from "./SelectAllCompute";
import { PipelineContext } from "./context";

const nodeSize = { x: 120, y: 80 };
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
  const svgClassName = `pipeline-tree__svg_${currentPipeline.data.id}`;
  const graphClassName = `pipeline-tree__graph_${currentPipeline.data.id}`;
  const { state } = React.useContext(PipelineContext);
  const { selectedPipeline } = state;
  const divRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = React.useState({
    x: 0,
    y: 0,
  });
  const size = useSize(divRef);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<TreeNode[]>();
  const [tsIds, setTsIds] = React.useState<{
    [key: string]: number[];
  }>();
  const { zoom, scaleExtent } = props;

  const bindZoomListener = React.useCallback(() => {
    const svg: Selection<SVGSVGElement, unknown, HTMLElement, any> = select(
      `.${svgClassName}`,
    );
    const g: Selection<SVGGElement, unknown, HTMLElement, any> = select(
      `.${graphClassName}`,
    );

    const zoom: ZoomBehavior<SVGSVGElement, unknown> = d3Zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([scaleExtent.min, scaleExtent.max])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg
      .call(zoom)
      .call(
        zoom.transform,
        zoomIdentity.translate(translate.x, translate.y).scale(scale),
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
  }, [currentPipeline.data.id, selectedPipeline?.[currentPipeline.data.id]]);

  React.useEffect(() => {
    if (size?.width) {
      setTranslate({
        x: size.width / 2.5,
        y: size.height / 6.5,
      });
    }
  }, [size]);

  const generateTree = () => {
    const d3Tree = tree<TreeNode>().nodeSize([nodeSize.x, nodeSize.y]);
    let nodes: HierarchyPointNode<TreeNode>[] | undefined = undefined;
    let links: HierarchyPointLink<TreeNode>[] | undefined = undefined;
    let newLinks: HierarchyPointLink<TreeNode>[] = [];
    if (data) {
      const rootNode = d3Tree(hierarchy(data[0]));
      nodes = rootNode.descendants();
      links = rootNode.links();
      const newLinksToAdd: HierarchyPointLink<TreeNode>[] = [];

      if (tsIds && Object.keys(tsIds).length > 0) {
        for (const link of links) {
          const targetId = link.target.data.id;
          const sourceId = link.source.data.id;

          if (targetId && sourceId && (tsIds[targetId] || tsIds[sourceId])) {
            // tsPlugin found
            let topologicalLink: HierarchyPointNode<TreeNode> | undefined;

            if (tsIds[targetId]) {
              topologicalLink = link.target;
            } else {
              topologicalLink = link.source;
            }

            if (topologicalLink) {
              const parents = tsIds[topologicalLink.data.id];
              if (parents && parents.length > 0) {
                const dict: { [key: string]: HierarchyPointNode<TreeNode> } =
                  {};

                // Iterate over all links to find nodes related to parents
                for (const innerLink of links) {
                  if (innerLink.source && innerLink.target) {
                    for (let i = 0; i < parents.length; i++) {
                      if (
                        innerLink.source.data.id === parents[i] &&
                        !dict[innerLink.source.data.id]
                      ) {
                        dict[innerLink.source.data.id] = innerLink.source;
                      } else if (
                        innerLink.target.data.id === parents[i] &&
                        !dict[innerLink.target.data.id]
                      ) {
                        dict[innerLink.target.data.id] = innerLink.target;
                      }
                    }
                  }
                }

                for (const key in dict) {
                  if (Object.prototype.hasOwnProperty.call(dict, key)) {
                    newLinksToAdd.push({
                      source: dict[key],
                      target: topologicalLink,
                    });
                  }
                }
              }
            }
          }
        }
      }
      newLinks = [...links, ...newLinksToAdd];
    }
    return { nodes, newLinks: newLinks };
  };

  const { nodes, newLinks: links } = generateTree();

  const calculateTreeDimensions = React.useMemo(() => {
    let maxX = 0;
    let maxY = 0;

    nodes?.forEach((node) => {
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });

    // Add padding to the calculated dimensions
    const padding = 150; // Adjust as needed
    const width = maxX + padding;
    const height = maxY + padding;

    return { width, height };
  }, [nodes]);

  // Update the SVG dimensions based on the calculated tree dimensions
  const { height } = calculateTreeDimensions;

  return (
    <>
      <div ref={divRef} className="feed-tree grabbable mode_tree">
        {loading ? (
          <SpinContainer title="Constructing the tree..." />
        ) : translate.x > 0 && translate.y > 0 ? (
          <div
            style={{
              display: "flex",
            }}
          >
            <svg
              focusable="true"
              className={`${svgClassName}`}
              height={height}
              width="100%"
            >
              <title>Pipeline Tree</title>
              <TransitionGroupWrapper
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
                      key={`node_${i}`}
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
            <div style={{ height: "3rem" }}>
              <SelectAllCompute pipeline={currentPipeline} />
            </div>
          </div>
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
