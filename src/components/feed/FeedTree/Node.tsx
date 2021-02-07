import React, { Fragment } from "react";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { Datum, TreeNodeDatum, Point } from "./data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstanceResourcePayload } from "../../../store/feed/types";


const DEFAULT_NODE_CIRCLE_RADIUS = 12;

type NodeProps = {
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<Datum> | null;
  selectedPlugin?: PluginInstance;
  onNodeClick: (node: PluginInstance) => void;
  onNodeToggle: (nodeId: string) => void;
  orientation: "horizontal" | "vertical";
  instances: PluginInstance[];
  toggleLabel: boolean;
  pluginInstanceResource?:  PluginInstanceResourcePayload;
};

type NodeState = {
  nodeTransform: string;
  hovered: boolean;
};



class Node extends React.Component<NodeProps, NodeState> {
  nodeRef: SVGElement | null = null;
  circleRef: SVGCircleElement | null = null;
  textRef: SVGTextElement | null = null;
  state = {
    nodeTransform: this.setNodeTransform(
      this.props.orientation,
      this.props.position,
      this.props.parent,
      true
    ),
    initialStyle: {
      opacity: 0,
    },
    hovered: false,
  };
  componentDidMount() {
    this.commitTransform();
  }

  componentDidUpdate() {
    this.commitTransform();
  }

  applyNodeTransform(transform: string, opacity = 1, done = () => {}) {
    select(this.nodeRef).attr("transform", transform).style("opacity", opacity);
    select(this.textRef).attr("transform", `translate(-28, 28)`);
  }

  commitTransform() {
    const { parent, position, orientation } = this.props;
    const nodeTransform = this.setNodeTransform(orientation, position, parent);
    this.applyNodeTransform(nodeTransform);
  }

  shouldComponentUpdate(nextProps:NodeProps, nextState:NodeState){
  
    const prevData=nextProps.pluginInstanceResource
    const thisData=this.props.pluginInstanceResource
    if(prevData !==thisData || nextProps.selectedPlugin !==this.props.selectedPlugin
      || nextProps.data !== this.props.data || nextProps.position !==this.props.position     
      ){
      return true;
    }
    return false;

  }

  setNodeTransform(
    orientation: NodeProps["orientation"],
    position: NodeProps["position"],
    parent: NodeProps["parent"],
    shouldTranslateToOrigin = false
  ) {
    return orientation === "horizontal"
      ? `translate(${position.y},${position.x})`
      : `translate(${position.x},${position.y})`;
  }

  handleNodeToggle = () => {
    this.props.onNodeToggle(this.props.data.__rd3t.id);
  };

  render() {
    const {
      data,
      selectedPlugin,
      onNodeClick,
      instances,
      toggleLabel,
    } = this.props;
    const { hovered } = this.state;
  
    let statusClass: string = "";
    let currentInstance: PluginInstance | undefined = undefined;
    if (instances) {
      currentInstance = instances.find((instance) => {
        if (data.item) {
          if (instance.data.id === data?.item.data.id) {
            return instance.data.status;
          } else return undefined;
        } else return undefined;
      });
    }

    let status: string = "scheduled";
    if (currentInstance) {
      status = currentInstance.data.status;
    }

    const currentId = data.item?.data.id;
    if (
      status &&
      (status === "started" ||
        status === "scheduled" ||
        status === "registeringFiles")
    ) {
      statusClass = "active";
    }
    if (status === "waitingForPrevious" || status === "scheduled") {
      statusClass = "queued";
    }

    if (status === "finishedSuccessfully") {
      statusClass = "success";
    }

    if (status === "finishedWithError" || status === "cancelled") {
      statusClass = "error";
    }

    const textLabel = (
      <g id={`text_${data.id}`}>
        <text
          ref={(n) => {
            this.textRef = n;
          }}
          className="label__title"
        >
          {data.item?.data.title || data.item?.data.plugin_name}
        </text>
      </g>
    );

    return (
      <Fragment>
        <g
          id={`${data.id}`}
          ref={(n) => {
            this.nodeRef = n;
          }}
          onMouseOver={() => {
            this.setState({
              hovered: !this.state.hovered,
            });
          }}
          onMouseOut={() => {
            this.setState({
              hovered: !this.state.hovered,
            });
          }}
          onClick={(event) => {
            if (data.item) {
              this.handleNodeToggle();
              onNodeClick(data.item);
            }
          }}
          transform={this.state.nodeTransform}
        >
          <circle
            id={`node_${data.id}`}
            className={`node ${statusClass} 
              ${selectedPlugin?.data.id === currentId && `selected`}
              `}
            r={DEFAULT_NODE_CIRCLE_RADIUS}
          ></circle>
          {toggleLabel ? textLabel : hovered ? textLabel : null}
        </g>
      </Fragment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: state.feed.pluginInstanceResource,
  selectedPlugin:state.feed.selectedPlugin
});

export default connect(mapStateToProps, null)(Node);