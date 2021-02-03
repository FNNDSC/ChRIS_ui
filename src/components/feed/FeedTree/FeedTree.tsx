import React, {RefObject} from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { tree, hierarchy } from "d3-hierarchy";
import { select, event } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity } from "d3-zoom";
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  PluginInstancePayload,
  ResourcePayload,
  FeedTreeProp,
} from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import "./FeedTree.scss";
import { getFeedTree, Datum, TreeNodeDatum, Point } from "./data";
import {isEqual} from 'lodash'
import Link from './Link'
import Node from './Node'
import TransitionGroupWrapper from "./TransitionGroupWrapper";
import { UndoIcon, RedoIcon} from "@patternfly/react-icons";
import { v4 as uuidv4 } from "uuid";
import clone from "clone";
import { setFeedTreeProp } from "../../../store/feed/actions";



interface ITreeProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  pluginInstanceResource: ResourcePayload;
  feedTreeProp: FeedTreeProp;
  setFeedTreeProp:(orientation:string)=>void;
}



interface Separation {
  siblings:number,
  nonSiblings:number
}

interface OwnProps {
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
}

type AllProps = ITreeProps & OwnProps;

type FeedTreeState = {
  data?: TreeNodeDatum[];
  d3: {
    translate: Point;
    scale: number;
  };
  separation: Separation;
  
};


const svgClassName='feed-tree__svg';
const graphClassName='feed-tree__graph'


class FeedTree extends React.Component<AllProps, FeedTreeState> {
  static defaultProps: Partial<AllProps> = {
    orientation: "vertical",
    scaleExtent: { min: 0.1, max: 1 },
    zoom: 1,
    nodeSize: { x: 100, y: 100 },
    separation: { siblings: 1, nonSiblings: 2 },
  };


  constructor(props: AllProps) {
    super(props);
   
    this.state = {
      d3: FeedTree.calculateD3Geometry(this.props),
      separation: this.props.separation,
    };
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

    const { data: instances } = this.props.pluginInstances;

    if (instances && instances.length > 0) {
      const tree = getFeedTree(instances);
      const transformedNode = FeedTree.assignInternalProperties(clone(tree));
      let separation: Separation | undefined = undefined;
      if (instances.length > 20) {
        separation = {
          siblings: 0.5,
          nonSiblings: 0.5,
        };
      }

      if (separation) {
        this.setState({
          ...this.state,
          data: transformedNode,
          separation,
        });
      } else {
        this.setState({
          ...this.state,
          data: transformedNode,
        });
      }
    }
  }

  static assignInternalProperties(data: Datum[], currentDepth: number = 0) {
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

  handleNodeToggle = (nodeId: string) => {
    const data = clone(this.state.data);
    const matches = this.findNodesById(nodeId, data, []);
    const targetNodeDatum = matches[0];

    if (targetNodeDatum.__rd3t.collapsed) {
      FeedTree.expandNode(targetNodeDatum);
    } else {
      FeedTree.collapseNode(targetNodeDatum);
    }

    this.setState({ data });
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

  componentDidUpdate(prevProps: AllProps) {
    const prevData = prevProps.pluginInstances.data;
    const thisData = this.props.pluginInstances.data;

    if (prevData !== thisData) {
      if (thisData) {
        const tree = getFeedTree(thisData);
        const transformedData = FeedTree.assignInternalProperties(clone(tree));
        let separation: Separation | undefined = undefined;
        if (thisData.length > 20) {
          separation = {
            siblings: 0.5,
            nonSiblings: 0.5,
          };
        }
        if (separation) {
          this.setState({
            ...this.state,
            data: transformedData,
            separation,
          });
        } else {
          this.setState({
            ...this.state,
            data: transformedData,
          });
        }
      }
    }

    if (
      !isEqual(
        this.props.feedTreeProp.translate,
        prevProps.feedTreeProp.translate
      ) ||
      this.props.feedTreeProp.orientation !==
        prevProps.feedTreeProp.orientation ||
      !isEqual(this.props.scaleExtent, prevProps.scaleExtent) ||
      this.props.zoom !== prevProps.zoom
    ) {
      this.bindZoomListener(this.props);
    }
  }

  shouldComponentUpdate(nextProps: AllProps, nextState: FeedTreeState) {
    if (
      !isEqual(
        this.props.feedTreeProp.translate,
        nextProps.feedTreeProp.translate
      ) ||
      this.props.feedTreeProp.orientation !==
        nextProps.feedTreeProp.orientation ||
      !isEqual(this.props.scaleExtent, nextProps.scaleExtent) ||
      !isEqual(
        this.props.pluginInstanceResource,
        nextProps.pluginInstanceResource
      ) ||
      this.props.selectedPlugin !== nextProps.selectedPlugin ||
      this.props.zoom !== nextProps.zoom ||
      this.props.pluginInstances.data !== nextProps.pluginInstances.data
    ) {
      return true;
    }
    return false;
  }

  handleNodeClick = (item: PluginInstance) => {
    this.props.onNodeClick(item);
  };

  

  generateTree() {
    const { nodeSize, orientation } = this.props;
    const { separation } = this.state;
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

  render() {
    const { nodes, links } = this.generateTree();
    const { translate, scale } = this.state.d3;
    const { selectedPlugin, feedTreeProp, setFeedTreeProp } = this.props;
    const { orientation } = feedTreeProp;

    return (
      <div className="feed-tree grabbable">
        <div
          onClick={() => {
            setFeedTreeProp(orientation);
          }}
          className="feed-tree__orientation"
        >
          {orientation === "vertical" ? (
            <RedoIcon className="feed-tree__orientation--icon" />
          ) : (
            <UndoIcon className="feed-tree__orientation--icon" />
          )}
        </div>

        <svg className={`${svgClassName}`} width="100%" height="100%">
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

            {nodes?.map(({ data, x, y, parent, ...rest }, i) => {
              return (
                <Node
                  key={`node + ${i}`}
                  data={data}
                  position={{ x, y }}
                  parent={parent}
                  selectedPlugin={selectedPlugin}
                  onNodeClick={this.handleNodeClick}
                  onNodeToggle={this.handleNodeToggle}
                  orientation={orientation}
                  pluginInstances={this.props.pluginInstances}
                />
              );
            })}
          </TransitionGroupWrapper>
        </svg>
      </div>
    );
  }
}


const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: state.feed.pluginInstanceResource,
  pluginInstances: state.feed.pluginInstances,
  selectedPlugin: state.feed.selectedPlugin,
  feedTreeProp: state.feed.feedTreeProp,
});

const mapDispatchToProps=(dispatch:Dispatch)=>({
  setFeedTreeProp:(orientation:string)=>dispatch(setFeedTreeProp(orientation))
})

export default connect(mapStateToProps, mapDispatchToProps)(FeedTree);