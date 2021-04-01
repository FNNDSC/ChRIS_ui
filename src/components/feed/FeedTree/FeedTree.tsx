import React from "react";
import { tree, hierarchy } from "d3-hierarchy";
import { select, event } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { PluginInstance } from "@fnndsc/chrisapi";
import { ResourcePayload, FeedTreeProp } from "../../../store/feed/types";

import "./FeedTree.scss";
import { Datum, TreeNodeDatum, Point } from "./data";
import { isEqual } from "lodash";
import Link from "./Link";
import Node from "./Node";
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import { UndoIcon, RedoIcon } from "@patternfly/react-icons";
import { v4 as uuidv4 } from "uuid";
import clone from "clone";

import { Switch, Button } from "@patternfly/react-core";

interface ITreeProps {
  instances: PluginInstance[];
  pluginInstanceResource: ResourcePayload;
  feedTreeProp: FeedTreeProp;
}

interface Separation {
  siblings: number;
  nonSiblings: number;
}

interface OwnProps {
  data: TreeNodeDatum[];
  onNodeClick: (node: PluginInstance) => void;
  translate: Point;
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

type AllProps = ITreeProps & OwnProps;

type FeedTreeState = {
  dataRef?: TreeNodeDatum[];
  data?: TreeNodeDatum[];
  d3: {
    translate: Point;
    scale: number;
  };
  collapsible: boolean;
  toggleLabel: boolean;
  isInitialRenderForDataset: boolean;
};

const svgClassName = "feed-tree__svg";
const graphClassName = "feed-tree__graph";

class FeedTree extends React.Component<AllProps, FeedTreeState> {
  static defaultProps: Partial<AllProps> = {
    orientation: "vertical",
    scaleExtent: { min: 0.1, max: 1 },
    zoom: 1,
    nodeSize: { x: 85, y: 60 },
  };

  constructor(props: AllProps) {
    super(props);

    this.state = {
      dataRef: this.props.data,
      data: FeedTree.assignInternalProperties(clone(this.props.data)),
      d3: FeedTree.calculateD3Geometry(this.props),
      collapsible: false,
      toggleLabel: false,
      isInitialRenderForDataset: true,
    };
  }

  static getDerivedStateFromProps(
    nextProps: AllProps,
    prevState: FeedTreeState
  ) {
    //@ts-ignore
    let derivedState: Partial<FeedTreeState> = null;

    if (nextProps.data !== prevState.dataRef) {
      derivedState = {
        dataRef: nextProps.data,
        data: FeedTree.assignInternalProperties(clone(nextProps.data)),
        isInitialRenderForDataset: true,
      };
    }

    const d3 = FeedTree.calculateD3Geometry(nextProps);
    if (!isEqual(d3, prevState.d3)) {
      derivedState = derivedState || {};
      derivedState.d3 = d3;
    }

    return derivedState;
  }

  static calculateD3Geometry(nextProps: AllProps) {
    let scale;
    if (nextProps.zoom > nextProps.scaleExtent.max) {
      scale = nextProps.scaleExtent.max;
    } else if (nextProps.zoom < nextProps.scaleExtent.min) {
      scale = nextProps.scaleExtent.min;
    } else {
      scale = nextProps.zoom;
    }
    return {
      translate: nextProps.feedTreeProp.translate,
      scale,
    };
  }

  componentDidMount() {
    this.bindZoomListener(this.props);
    this.setState({
      ...this.state,
      isInitialRenderForDataset: false,
    });
  }

  componentDidUpdate(prevProps: AllProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        ...this.state,
        isInitialRenderForDataset: false,
      });
    }

    if (
      !isEqual(this.props.translate, prevProps.translate) ||
      !isEqual(this.props.scaleExtent, prevProps.scaleExtent) ||
      this.props.zoom !== prevProps.zoom
    ) {
      // If zoom-specific props change -> rebind listener with new values.
      // Or: rebind zoom listeners to new DOM nodes in case legacy transitions were enabled/disabled.
      this.bindZoomListener(this.props);
    }
  }

  static assignInternalProperties(data: Datum[], currentDepth = 0) {
    const d = Array.isArray(data) ? data : [data];

    return d.map((n) => {
      const nodeDatum = n as TreeNodeDatum;

      nodeDatum.__rd3t.id = uuidv4();
      nodeDatum.__rd3t.depth = currentDepth;
      if (nodeDatum.children && nodeDatum.children.length > 0) {
        nodeDatum.children = FeedTree.assignInternalProperties(
          nodeDatum.children,
          currentDepth + 1
        );
      }
      return nodeDatum;
    });
  }

  static collapseNode(nodeDatum: TreeNodeDatum) {
    nodeDatum.__rd3t.collapsed = true;
    if (nodeDatum.children && nodeDatum.children.length > 0) {
      nodeDatum.children.forEach((child) => {
        FeedTree.collapseNode(child);
      });
    }
  }

  /**
   * Sets the internal `collapsed` property of
   * the passed `TreeNodeDatum` object to `false`.
   *
   * @static
   */
  static expandNode(nodeDatum: TreeNodeDatum) {
    nodeDatum.__rd3t.collapsed = false;
  }

  findNodesById(
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
        hits = this.findNodesById(nodeId, node.children, hits);
      }
    });

    return hits;
  }

  findNodesAtDepth(
    depth: number,
    nodeSet: TreeNodeDatum[],
    accumulator: TreeNodeDatum[]
  ) {
    accumulator = accumulator.concat(
      nodeSet.filter((node) => node.__rd3t.depth === depth)
    );
    nodeSet.forEach((node) => {
      if (node.children && node.children.length > 0) {
        accumulator = this.findNodesAtDepth(depth, node.children, accumulator);
      }
    });
    return accumulator;
  }

  collapseNeighborNodes(targetNode: TreeNodeDatum, nodeSet: TreeNodeDatum[]) {
    const neighbors = this.findNodesAtDepth(
      targetNode.__rd3t.depth,
      nodeSet,
      []
    ).filter((node) => node.__rd3t.id !== targetNode.__rd3t.id);
    neighbors.forEach((neighbor) => FeedTree.collapseNode(neighbor));
  }

  handleNodeToggle = (nodeId: string) => {
    const data = clone(this.state.data);
    const matches = this.findNodesById(nodeId, data, []);
    const targetNodeDatum = matches[0];

    if (this.state.collapsible) {
      if (targetNodeDatum.__rd3t.collapsed) {
        FeedTree.expandNode(targetNodeDatum);
      } else {
        FeedTree.collapseNode(targetNodeDatum);
      }
      this.setState({ data });
    }
  };

  bindZoomListener = (props: AllProps) => {
    const { zoom, scaleExtent, feedTreeProp } = props;
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
          this.setState({
            ...this.state,
            d3: {
              ...this.state.d3,
              translate: {
                x: event.transform.x,
                y: event.transform.y,
              },
            },
          });
        })
    );
  };

  handleNodeClick = (item: PluginInstance) => {
    this.props.onNodeClick(item);
  };

  shouldComponentUpdate(nextProps: AllProps, nextState: FeedTreeState) {
    if (
      !isEqual(
        this.props.feedTreeProp.translate,
        nextProps.feedTreeProp.translate
      ) ||
      this.props.feedTreeProp.orientation !==
        nextProps.feedTreeProp.orientation ||
      !isEqual(this.props.scaleExtent, nextProps.scaleExtent) ||
      nextState.collapsible !== this.state.collapsible ||
      nextState.toggleLabel !== this.state.toggleLabel ||
      nextProps.isSidePanelExpanded !== this.props.isSidePanelExpanded ||
      nextProps.isBottomPanelExpanded !== this.props.isBottomPanelExpanded ||
      !isEqual(this.state.data, nextState.data) ||
      this.props.zoom !== nextProps.zoom ||
      this.props.instances !== nextProps.instances
    ) {
      return true;
    }
    return false;
  }

  generateTree() {
    const { nodeSize, orientation, separation } = this.props;

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
    let links;

    if (this.state.data) {
      const rootNode = d3Tree(
        hierarchy(this.state.data[0], (d) =>
          d.__rd3t.collapsed ? null : d.children
        )
      );
      nodes = rootNode.descendants();
      links = rootNode.links();
    }

    return { nodes, links };
  }

  handleChange = (feature: string) => {
    if (feature === "collapsible") {
      this.setState({
        ...this.state,
        collapsible: !this.state.collapsible,
      });
    }

    if (feature === "label") {
      this.setState({
        ...this.state,
        toggleLabel: !this.state.toggleLabel,
      });
    }
  };

  render() {
    const { nodes, links } = this.generateTree();
    const { translate, scale } = this.state.d3;
    const { instances, feedTreeProp, changeOrientation } = this.props;
    const { orientation } = feedTreeProp;

    return (
      <div className="feed-tree grabbable">
        <div className="feed-tree__container">
          <div className="feed-tree__container--labels">
            <div
              onClick={() => {
                changeOrientation(orientation);
              }}
              className="feed-tree__orientation"
            >
              {orientation === "vertical" ? (
                <RedoIcon className="feed-tree__orientation--icon" />
              ) : (
                <UndoIcon className="feed-tree__orientation--icon" />
              )}
            </div>
            <div className="feed-tree__orientation">
              <Switch
                id="collapsible"
                label="Collapsible on"
                labelOff="Collapsible off"
                isChecked={this.state.collapsible}
                onChange={() => {
                  this.handleChange("collapsible");
                }}
              />
            </div>
            <div className="feed-tree__orientation">
              <Switch
                id="labels"
                label="Show Labels"
                labelOff="Hide Labels"
                isChecked={this.state.toggleLabel}
                onChange={() => {
                  this.handleChange("label");
                }}
              />
            </div>
          </div>
          {!this.props.isSidePanelExpanded && (
            <div className="feed-tree__container--panelToggle">
              <div className="feed-tree__orientation">
                <Button
                  type="button"
                  onClick={() => this.props.onExpand("side_panel")}
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
                <Node
                  key={`node + ${i}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  onNodeClick={this.handleNodeClick}
                  onNodeToggle={this.handleNodeToggle}
                  orientation={orientation}
                  instances={instances}
                  toggleLabel={this.state.toggleLabel}
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
        {!this.props.isBottomPanelExpanded && (
          <div className="feed-tree__container--panelToggle">
            <div className="feed-tree__orientation">
              <Button
                type="button"
                onClick={() => this.props.onExpand("bottom_panel")}
              >
                Feed Browser
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default FeedTree;
