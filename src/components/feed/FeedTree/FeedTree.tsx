import React from "react";
import { connect } from "react-redux";
import { select, tree, hierarchy, zoom as d3Zoom, zoomIdentity, event } from "d3";
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  PluginInstancePayload,
  ResourcePayload,
} from "../../../store/feed/types";

import { ApplicationState } from "../../../store/root/applicationState";
import "./FeedTree.scss";
import { getFeedTree, Datum } from "./data";
import {isEqual} from 'lodash'
import Link from './Link'
import Node from './Node'
import TransitionGroupWrapper from "./TransitionGroupWrapper";



interface ITreeProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  pluginInstanceResource: ResourcePayload;
}

interface Point {
  x: number;
  y: number; 
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
  separation: {
    siblings: number;
    nonSiblings: number;
  };
}

type AllProps = ITreeProps & OwnProps;

type FeedTreeState = {
  data?:Datum;
  d3:{
    translate:Point,
    scale:number
  }
}


const svgClassName='feed-tree__svg';
const graphClassName='feed-tree__graph'


class FeedTree extends React.Component<AllProps, FeedTreeState> {
  static defaultProps: Partial<AllProps> = {
    translate: { x:600, y:50},
    scaleExtent: { min: 0.1, max: 1 },
    zoom: 1,
    nodeSize: { x: 120, y: 120 },
    separation: { siblings: 1, nonSiblings: 2 },
  };

  constructor(props: AllProps) {
    super(props);

    this.state = {
      d3: FeedTree.calculateD3Geometry(this.props),
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
      translate: nextProps.translate,
      scale,
    };
  }

  componentDidMount() {
    this.bindZoomListener(this.props);
    const { data: instances } = this.props.pluginInstances;
    if (instances && instances.length > 0) {
      const tree = getFeedTree(instances);
      this.setState({
        ...this.state,
        data: tree[0],
      });
    }
  }

  bindZoomListener = (props: AllProps) => {
    const { zoom, scaleExtent, translate } = props;
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
        this.setState({
          ...this.state,
          data: tree[0],
        });
      }
    }

    if (
      !isEqual(this.props.translate, prevProps.translate) ||
      !isEqual(this.props.scaleExtent, prevProps.scaleExtent) ||
      this.props.zoom !== prevProps.zoom
    ) {
      this.bindZoomListener(this.props);
    }
  }

  handleNodeClick=(item:PluginInstance)=>{
    this.props.onNodeClick(item)
  }

  generateTree() {
    const { nodeSize, separation } = this.props;
    const d3Tree = tree<Datum>()
      .nodeSize([nodeSize.x, nodeSize.y])
      .separation((a, b) => {
        return a.data.parentId === b.data.parentId
          ? separation.siblings
          : separation.nonSiblings;
      });

    let nodes;
    let links;
    if (this.state.data) {
      const rootNode = d3Tree(hierarchy(this.state.data));
      nodes = rootNode.descendants();
      links = rootNode.links();
    }

    return { nodes, links };
  }

  render() {
    const { nodes, links } = this.generateTree();
    const { translate, scale } = this.state.d3;
    const { selectedPlugin} = this.props;

   
    return (
      <div  className="feed-tree grabbable">
        <svg className={`${svgClassName}`} width="100%" height="100%">
          <TransitionGroupWrapper
            component="g"
            className={graphClassName}
            transform={`translate(${translate.x},${translate.y}) scale(${scale})`}
          >
            {links?.map((linkData, i) => {
              return <Link key={"link" + i} linkData={linkData} />;
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
});

export default connect(mapStateToProps, {})(FeedTree);