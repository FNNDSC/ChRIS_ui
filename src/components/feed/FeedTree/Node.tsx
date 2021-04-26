import React, { Fragment } from "react";
import { select } from "d3-selection";
import { HierarchyPointNode } from "d3-hierarchy";
import { Datum, TreeNodeDatum, Point, getTsNodes } from "./data";
import { PluginInstance } from "@fnndsc/chrisapi";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstanceStatusPayload } from "../../../store/feed/types";

const DEFAULT_NODE_CIRCLE_RADIUS = 12;

type NodeProps = {
  tsNodes?: PluginInstance[];
  mode: boolean;
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<Datum> | null;
  selectedPlugin?: PluginInstance;
  onNodeClick: (node: PluginInstance) => void;
  onNodeClickTs: (node: PluginInstance) => void;
  onNodeToggle: (nodeId: string) => void;
  orientation: "horizontal" | "vertical";
  instances: PluginInstance[];
  toggleLabel: boolean;
  pluginInstanceStatus?: PluginInstanceStatusPayload;
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
      this.props.position
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

  applyNodeTransform(transform: string, opacity = 1) {
    select(this.nodeRef).attr("transform", transform).style("opacity", opacity);
    select(this.textRef).attr("transform", `translate(-28, 28)`);
  }

  commitTransform() {
    const { position, orientation } = this.props;
    const nodeTransform = this.setNodeTransform(orientation, position);
    this.applyNodeTransform(nodeTransform);
  }

  shouldComponentUpdate(nextProps: NodeProps, nextState: NodeState) {
    const prevData = nextProps.pluginInstanceStatus;
    const thisData = this.props.pluginInstanceStatus;
    if (
      prevData !== thisData ||
      nextProps.selectedPlugin !== this.props.selectedPlugin ||
      nextProps.data !== this.props.data ||
      nextProps.position !== this.props.position ||
      nextState.hovered !== this.state.hovered ||
      nextProps.instances !== this.props.instances ||


                nextProps.mode !==   this.props.mode ||
     
     
      nextProps.tsNodes !== this.props.tsNodes
    ) {
      return true;
    }
    return false;
  }

  setNodeTransform(
    orientation: NodeProps["orientation"],
    position: NodeProps["position"]
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
      onNodeClickTs,
      toggleLabel,
      pluginInstanceStatus,
      mode,
      tsNodes,
    } = this.props;
   
    const { hovered } = this.state;
    let status = "";
    let statusClass = "";
    let tsClass = "";
    if (
      data.item &&
      data.item.data.id &&
      pluginInstanceStatus &&
      pluginInstanceStatus[data.item.data.id]
    ) {
      status = pluginInstanceStatus[data.item.data.id].status;
    } else if (data.item) {
      status = data.item.data.status;
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
    if (status === "waiting") {
      statusClass = "queued";
    }

    if (status === "finishedSuccessfully") {
      statusClass = "success";
    }

    if (status === "finishedWithError" || status === "cancelled") {
      statusClass = "error";
    }

    if (mode === false && tsNodes && tsNodes.length > 0) {
      if (data.item?.data.id) {
        const node = tsNodes.find(
          (node) => node.data.id === data.item?.data.id
        );
        if (node) {
          tsClass = "graphSelected";
        }
      }
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
          onClick={() => {
            if (data.item) {
              this.handleNodeToggle();
              if (mode === false) {
                onNodeClickTs(data.item);
              } else {
                onNodeClick(data.item);
              }
            }
          }}
          transform={this.state.nodeTransform}
        >
          <circle
            id={`node_${data.id}`}
            className={`node ${statusClass} ${tsClass}
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
  pluginInstanceStatus: state.feed.pluginInstanceStatus,
  selectedPlugin: state.feed.selectedPlugin,
  mode: state.feed.treeMode,
  tsNodes: state.feed.tsNodes,
});

export default connect(mapStateToProps)(Node);
