import React from "react";
import {
  tree,
  hierarchy,
  HierarchyPointLink,
  HierarchyPointNode,
} from "d3-hierarchy";
import { select, event } from "d3-selection";
import { v4 as uuidv4 } from "uuid";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { PluginInstance } from "@fnndsc/chrisapi";
import { AiOutlineRotateLeft, AiOutlineRotateRight } from "react-icons/ai";
import Link from "./Link";
import NodeWrapper from "./Node";
import { Datum, TreeNodeDatum, Point } from "./data";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import { isEqual } from "lodash";
import clone from "clone";
import { Switch, Button, Alert } from "@patternfly/react-core";
import { TSID } from "./ParentComponent";
import { useTypedSelector } from "../../../store/hooks";
import "./FeedTree.scss";
import { FeedTreeProp } from "../../../store/feed/types";
import { FeedTreeScaleType, NodeScaleDropdown } from "./Controls";

interface Separation {
  siblings: number;
  nonSiblings: number;
}

interface OwnProps {
  tsIds?: TSID;
  data: TreeNodeDatum[];
  onNodeClick: (node: PluginInstance) => void;
  onNodeClickTs: (node: PluginInstance) => void;
  translate?: Point;
  scaleExtent: {
    min: number;
    max: number;
  };
  zoom: number;
  nodeSize: {
    x: number;
    y: number;
  };
  separation: Separation;
  orientation: "horizontal" | "vertical";
  changeOrientation: (orientation: string) => void;
  isSidePanelExpanded: boolean;
  isBottomPanelExpanded: boolean;
  onExpand: (panel: string) => void;
}

type AllProps = OwnProps;

type FeedTreeState = {
  data?: TreeNodeDatum[];
  d3: {
    translate: Point;
    scale: number;
  };
  overlayScale: {
    // overlay of individual nodes based on time or size
    enabled: boolean;
    type: FeedTreeScaleType;
  };
  collapsible: boolean;
  toggleLabel: boolean;
};

function assignInternalProperties(data: Datum[], currentDepth = 0) {
  const d = Array.isArray(data) ? data : [data];

  return d.map((n) => {
    const nodeDatum = n as TreeNodeDatum;

    nodeDatum.__rd3t.id = uuidv4();
    nodeDatum.__rd3t.depth = currentDepth;
    if (nodeDatum.children && nodeDatum.children.length > 0) {
      nodeDatum.children = assignInternalProperties(
        nodeDatum.children,
        currentDepth + 1
      );
    }
    return nodeDatum;
  });
}

function calculateD3Geometry(nextProps: AllProps, feedTreeProp: FeedTreeProp) {
  let scale;
  if (nextProps.zoom > nextProps.scaleExtent.max) {
    scale = nextProps.scaleExtent.max;
  } else if (nextProps.zoom < nextProps.scaleExtent.min) {
    scale = nextProps.scaleExtent.min;
  } else {
    scale = nextProps.zoom;
  }
  return {
    translate: feedTreeProp.translate,
    scale,
  };
}

function findNodesById(
  nodeId: string,
  nodeSet: TreeNodeDatum[],
  hits: TreeNodeDatum[]
) {
  if (hits.length > 0) {
    return hits;
  }
  hits = hits.concat(nodeSet.filter((node) => node.__rd3t.id === nodeId));
  nodeSet.forEach((node) => {
    if (node.children && node.children.length > 0) {
      hits = findNodesById(nodeId, node.children, hits);
    }
  });

  return hits;
}

function collapseNode(nodeDatum: TreeNodeDatum) {
  nodeDatum.__rd3t.collapsed = true;
  if (nodeDatum.children && nodeDatum.children.length > 0) {
    nodeDatum.children.forEach((child) => {
      collapseNode(child);
    });
  }
}

/**
 * Sets the internal `collapsed` property of
 * the passed `TreeNodeDatum` object to `false`.
 *
 * @expandNode
 */
function expandNode(nodeDatum: TreeNodeDatum) {
  nodeDatum.__rd3t.collapsed = false;
}

function getInitialState(
  props: AllProps,
  feedTreeProp: FeedTreeProp
): FeedTreeState {
  return {
    data: assignInternalProperties(clone(props.data)),
    d3: calculateD3Geometry(props, feedTreeProp),
    overlayScale: {
      enabled: false,
      type: "time",
    },
    collapsible: false,
    toggleLabel: false,
  };
}

const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";

const FeedTree = (props: AllProps) => {
  const feedTreeProp = useTypedSelector((state) => state.feed.feedTreeProp);
  const mode = useTypedSelector((state) => state.tsPlugins.treeMode);
  const [feedState, setFeedState] = React.useState<FeedTreeState>(
    getInitialState(props, feedTreeProp)
  );
  const { translate, scale } = feedState.d3;
  const { changeOrientation, zoom, scaleExtent } = props;
  const { orientation } = feedTreeProp;

  const bindZoomListener = React.useCallback(() => {
    const { translate } = feedTreeProp;
    const svg = select(`.${svgClassName}`);
    const g = select(`.${graphClassName}`);

    svg.call(
      //@ts-ignore
      d3Zoom().transform,
      zoomIdentity.translate(translate.x, translate.y).scale(zoom)
    );

    svg.call(
      //@ts-ignore
      d3Zoom()
        .scaleExtent([scaleExtent.min, scaleExtent.max])
        .on("zoom", () => {
          g.attr("transform", event.transform);
        })
    );
  }, [zoom, scaleExtent, feedTreeProp]);

  React.useEffect(() => {
    bindZoomListener();
  }, [bindZoomListener]);

  React.useEffect(() => {
    if (props.data) {
      setFeedState((feedState) => {
        return {
          ...feedState,
          data: assignInternalProperties(clone(props.data)),
        };
      });
    }
  }, [props.data]);

  const handleChange = (feature: string, data?: any) => {
    if (feature === "collapsible") {
      setFeedState({
        ...feedState,
        collapsible: !feedState.collapsible,
      });
    }

    if (feature === "label") {
      setFeedState({
        ...feedState,
        toggleLabel: !feedState.toggleLabel,
      });
    }

    if (feature === "scale_enabled") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          enabled: !feedState.overlayScale.enabled,
        },
      });
    }

    if (feature === "scale_type") {
      setFeedState({
        ...feedState,
        overlayScale: {
          ...feedState.overlayScale,
          type: data,
        },
      });
    }
  };

  const handleNodeClick = (item: PluginInstance) => {
    props.onNodeClick(item);
  };

  const handleNodeClickTs = (item: PluginInstance) => {
    props.onNodeClickTs(item);
  };

  const handleNodeToggle = (nodeId: string) => {
    const data = clone(feedState.data);
    const matches = findNodesById(nodeId, data, []);
    const targetNodeDatum = matches[0];

    if (feedState.collapsible) {
      if (targetNodeDatum.__rd3t.collapsed) {
        expandNode(targetNodeDatum);
      } else {
        collapseNode(targetNodeDatum);
      }
      setFeedState({
        ...feedState,
        data,
      });
    }
  };

  const generateTree = () => {
    const { nodeSize, orientation, separation, tsIds } = props;
    const { data } = feedState;

    const d3Tree = tree<TreeNodeDatum>()
      .nodeSize(
        orientation === "horizontal"
          ? [nodeSize.y, nodeSize.x]
          : [nodeSize.x, nodeSize.y]
      )
      .separation((a, b) => {
        return a.data.parentId === b.data.parentId
          ? separation.siblings
          : separation.nonSiblings;
      });

    let nodes;
    let links: HierarchyPointLink<TreeNodeDatum>[] | undefined = undefined;
    const newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

    if (data) {
      const rootNode = d3Tree(
        hierarchy(data[0], (d) => (d.__rd3t.collapsed ? null : d.children))
      );
      nodes = rootNode.descendants();
      links = rootNode.links();

      const targetNodes = links.filter((link) => {
        //@ts-ignore
        return link.target.data.item?.data.plugin_type === "ts";
      });

      const remodifiedLinks = targetNodes.map((node) => {
        const target = node.target;
        const sources: HierarchyPointNode<TreeNodeDatum>[] = [];
        // find all the source nodes;
        links?.forEach((link) => {
          if (
            target.data.id &&
            tsIds &&
            tsIds[target.data.id] &&
            tsIds[target.data.id].includes(`${link.target.data.id}`)
          ) {
            sources.push(link.target);
          }
        });

        return sources?.map((source) => {
          if (source) return { source, target };
        });
      });

      if (remodifiedLinks) {
        for (let i = 0; i < remodifiedLinks.length; i++) {
          const tempLinks = remodifiedLinks[i];
          if (tempLinks && tempLinks.length > 0) {
            //@ts-ignore
            newLinks.push(...tempLinks);
          }
        }
      }
    }
    //@ts-ignore
    newLinks.push(...links);
    return { nodes, newLinks };
  };

  const { nodes, newLinks: links } = generateTree();

  return (
    <div
      className={`feed-tree grabbable mode_${mode === false ? "graph" : ""}`}
    >
      <div className="feed-tree__container">
        <div className="feed-tree__container--labels">
          <div
            onClick={() => {
              changeOrientation(orientation);
            }}
            className="feed-tree__orientation"
          >
            {orientation === "vertical" ? (
              <AiOutlineRotateLeft className="feed-tree__orientation--icon" />
            ) : (
              <AiOutlineRotateRight className="feed-tree__orientation--icon" />
            )}
          </div>
          <div className="feed-tree__control">
            <Switch
              id="collapsible"
              label="Collapsible On"
              labelOff="Collapsible Off"
              isChecked={feedState.collapsible}
              onChange={() => {
                handleChange("collapsible");
              }}
            />
          </div>
          <div className="feed-tree__control">
            <Switch
              id="labels"
              label="Show Labels"
              labelOff="Hide Labels"
              isChecked={feedState.toggleLabel}
              onChange={() => {
                handleChange("label");
              }}
            />
          </div>
          <div className="feed-tree__control feed-tree__individual-scale">
            <Switch
              id="individual-scale"
              label="Scale Nodes On"
              labelOff="Scale Nodes Off "
              isChecked={feedState.overlayScale.enabled}
              onChange={() => {
                handleChange("scale_enabled");
              }}
            />
            {feedState.overlayScale.enabled && (
              <div className="dropdown-wrap">
                <NodeScaleDropdown
                  selected={feedState.overlayScale.type}
                  onChange={(type) => {
                    handleChange("scale_type", type);
                  }}
                />
              </div>
            )}
          </div>
          {mode === false && (
            <div className="feed-tree__orientation">
              <Alert
                variant="info"
                title="You are now in a ts node selection mode"
              />
            </div>
          )}
        </div>
        {!props.isSidePanelExpanded && (
          <div className="feed-tree__container--panelToggle">
            <div className="feed-tree__orientation">
              <Button
                type="button"
                onClick={() => props.onExpand("side_panel")}
              >
                Node Panel
              </Button>
            </div>
          </div>
        )}
      </div>

      <svg className={`${svgClassName}`} width="100%" height="85%">
        <TransitionGroupWrapper
          component="g"
          className={graphClassName}
          transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
        >
          {links?.map((linkData, i) => {
            return (
              <Link
                orientation={orientation}
                key={"link" + i}
                linkData={linkData}
              />
            );
          })}

          {nodes?.map(({ data, x, y, parent }, i) => {
            return (
              <NodeWrapper
                key={`node + ${i}`}
                data={data}
                position={{ x, y }}
                parent={parent}
                onNodeClick={handleNodeClick}
                onNodeClickTs={handleNodeClickTs}
                onNodeToggle={handleNodeToggle}
                orientation={orientation}
                toggleLabel={feedState.toggleLabel}
                overlayScale={
                  feedState.overlayScale.enabled
                    ? feedState.overlayScale.type
                    : undefined
                }
              />
            );
          })}
        </TransitionGroupWrapper>
      </svg>
      {!props.isBottomPanelExpanded && (
        <div className="feed-tree__container--panelToggle">
          <div className="feed-tree__orientation">
            <Button
              type="button"
              onClick={() => props.onExpand("bottom_panel")}
            >
              Feed Browser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(
  FeedTree,
  (prevProps: AllProps, nextProps: AllProps) => {
    if (
      nextProps.isSidePanelExpanded !== prevProps.isSidePanelExpanded ||
      nextProps.isBottomPanelExpanded !== prevProps.isBottomPanelExpanded ||
      !isEqual(prevProps.data, nextProps.data) ||
      prevProps.zoom !== nextProps.zoom ||
      prevProps.tsIds !== nextProps.tsIds
    ) {
      return false;
    }
    return true;
  }
);

FeedTree.defaultProps = {
  orientation: "vertical",
  scaleExtent: { min: 0.1, max: 1 },
  zoom: 1,
  nodeSize: { x: 85, y: 60 },
};
