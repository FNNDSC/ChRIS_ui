import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import useSize from "./useSize";
import { tree, hierarchy, HierarchyPointLink } from "d3-hierarchy";
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
import { setFeedLayout, setTranslate } from "../../../store/feed/actions";
import { FeedTreeProp } from "../../../store/feed/types";
import { FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import "./FeedTree.scss";

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
  const dispatch = useDispatch();
  const divRef = useRef<HTMLDivElement>(null);
  const { feedTreeProp, currentLayout } = useTypedSelector(
    (state) => state.feed
  );

  const size = useSize(divRef);

  React.useEffect(() => {
    //@ts-ignore
    if (size && size.width) {
      //@ts-ignore
      dispatch(setTranslate({ x: size.width / 2, y: 90 }));
    }
  }, [size, dispatch]);

  const mode = useTypedSelector((state) => state.tsPlugins.treeMode);
  const [feedState, setFeedState] = React.useState<FeedTreeState>(
    getInitialState(props, feedTreeProp)
  );
  const { scale } = feedState.d3;
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
    let newLinks: HierarchyPointLink<TreeNodeDatum>[] = [];

    if (data) {
      const rootNode = d3Tree(
        hierarchy(data[0], (d) => (d.__rd3t.collapsed ? null : d.children))
      );
      nodes = rootNode.descendants();
      links = rootNode.links();

      const newLinksToAdd: any[] = [];

      if (tsIds) {
        links.forEach((link) => {
          const id = link.target.data.id;
          if (
            link.target.data.item?.data.plugin_type === "ts" &&
            id &&
            tsIds[id]
          ) {
            const parentIds = tsIds[id];

            for (let i = 0; i < parentIds.length; i++) {
              const newLink = links?.find(
                (link) => parentIds[i] === link.source.data.id
              );

              const exists = links?.find(
                (linkArr) =>
                  newLink?.source.data.id === linkArr.source.data.id &&
                  link.target.data.id === linkArr.target.data.id
              );

              if (newLink && !exists) {
                newLinksToAdd.push({
                  source: newLink.source,
                  target: link.target,
                });
              }
            }
          }
        });
      }

      newLinks = [...links, ...newLinksToAdd];
    }

    return { nodes, newLinks: newLinks };
  };

  const { nodes, newLinks: links } = generateTree();

  return (
    <div
      className={`feed-tree grabbable mode_${
        mode === false ? "graph" : "tree"
      }`}
      ref={divRef}
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
          <div className="feed-tree__control">
            <Switch
              id="layout"
              label="Switch Layout"
              labelOff="3D"
              isChecked={currentLayout}
              onChange={() => {
                dispatch(setFeedLayout());
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

      {feedTreeProp.translate.x > 0 && feedTreeProp.translate.y > 0 && (
        <svg className={`${svgClassName}`} width="100%" height="85%">
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${feedTreeProp.translate.x},${feedTreeProp.translate.y}) scale(${scale})`}
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
      )}

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
  nodeSize: { x: 120, y: 80 },
};
