import React, { useEffect, useRef } from "react";
import { PluginInstance } from "@fnndsc/chrisapi";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginStatus } from "../../../store/plugin/types";
import { tree, select, linkVertical, stratify, svg } from "d3";
import "./styles/feedTree.scss";
import { getPluginInstanceResources } from "../../../store/plugin/actions";
import { stopFetchingPluginResources } from "../../../store/feed/actions";

interface ITreeProps {
  items: PluginInstance[];
  selected: PluginInstance;
  pluginStatus?: PluginStatus[];
  isComputeError?: boolean;
  testStatus: {
    [key: string]: string;
  };
}
interface ITreeActions {
  onNodeClick: (node: any) => void;
  getPluginInstanceResources: (items: PluginInstance[]) => void;
  stopFetchingPluginResources: (id: number) => void;
}
type AllProps = ITreeProps & ITreeActions;


const FeedTree:React.FC<AllProps>=(props)=>{
const treeRef=useRef<HTMLDivElement>(null);
const svgRef=useRef<SVGSVGElement>(null);

useEffect(() => {
  console.log("Selected", props.testStatus);
  if (!!treeRef.current && !!props.items && props.items.length > 0) {
    const { items } = props;
    let dimensions = { height: 300, width: 700 };

    if (items.length === 2) {
      dimensions.height = 100;
    }

    select("#tree").selectAll("svg").selectAll("g").remove();
    let svg = select(svgRef.current)
      .attr("width", `${dimensions.width + 100}`)
      .attr("height", `${dimensions.height + 100}`);

    const activeNode = items.filter((node) => {
      return (
        node.data.status === "started" ||
        node.data.status === "scheduled" ||
        node.data.status === "registeringFiles"
      );
    });

    const errorNode = items.filter((node) => {
      return node.data.status === "finishedWithError";
    });

    const queuedNode = items.filter((node) => {
      return node.data.status === "waitingForPrevious";
    });

    const successNode = items.filter((node) => {
      return node.data.status === "finishedSuccessfully";
    });

    let graph = svg.append("g").attr("transform", "translate(50,50)");
    graph.selectAll(".node").remove();
    graph.selectAll(".link").remove();
    const stratified = stratify()
      .id((d: any) => d.data.id)
      .parentId((d: any) => d.data.previous_id);
    const root = stratified(items);
    let d3TreeLayout = tree();
    d3TreeLayout.size([dimensions.width, dimensions.height]);
    d3TreeLayout(root);

    let nodeRadius = 10;

    // Nodes
    graph
      .selectAll(".node")
      .data(root.descendants())
      .join((enter) => enter.append("circle").attr("opacity", 0))
      .on("click", handleNodeClick)
      .attr("class", "node")

      .attr("id", (d: any) => {
        return `node_${d.data.data.id}`;
      })
      .attr("r", nodeRadius)
      .attr("fill", "#fff")
      .attr("cx", (node: any) => node.x)
      .attr("cy", (node: any) => node.y)
      .attr("opacity", 1);

    const linkGenerator = linkVertical()
      .x((node: any) => node.x)
      .y((node: any) => node.y);

    // Links

    graph
      .selectAll(".link")
      .data(root.links())
      .join("path")
      // @ts-ignore
      .attr("d", linkGenerator)
      // @ts-ignore
      .attr("stroke", function () {
        // @ts-ignore
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashhoffset", function () {
        // @ts-ignore
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", 0)
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", "white")
      .attr("opacity", 1);

    // labels

    graph
      .selectAll(".label")
      .data(root.descendants())
      .join("text")
      .attr("class", "label")
      .text((node: any) => node.data.data.plugin_name)
      .attr("transform", (d: any) => {
        return `translate(${d.x - nodeRadius * 4}, ${d.y + nodeRadius * 4} )`;
      })
      .attr("fill", "#fff")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("opacity", 1);

    if (activeNode.length > 0) {
      activeNode.forEach(function (node) {
        const d3activeNode = select(`#node_${node.data.id}`);

        if (!!d3activeNode && !d3activeNode.empty()) {
          d3activeNode.attr("class", `node active`);
        }
      });
    }

    if (errorNode.length > 0) {
      errorNode.forEach(function (node) {
        const d3errorNode = select(`#node_${node.data.id}`);
        const isSelected = node.data.id === props.selected.data.id;
        if (!!d3errorNode && !d3errorNode.empty()) {
          d3errorNode.attr("class", `node error ${isSelected && "selected"}`);
        }
      });
    }

    if (queuedNode.length > 0) {
      queuedNode.forEach(function (node) {
        const d3QueuedNode = select(`#node_${node.data.id}`);
        if (!!d3QueuedNode && !d3QueuedNode.empty()) {
          d3QueuedNode.attr("class", `node queued`);
        }
      });
    }

    if (successNode.length > 0) {
      successNode.forEach(function (node) {
        const d3SuccessNode = select(`#node_${node.data.id}`);
        const isSelected = node.data.id === props.selected.data.id;
        if (!!d3SuccessNode && !d3SuccessNode.empty()) {
          d3SuccessNode.attr(
            "class",
            `node success ${isSelected && "selected"}`
          );
        }
      });
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.items, props.selected, props.testStatus]);



const handleNodeClick = (node: any) => {
  props.onNodeClick(node.data);
};


return (
  <div
    style={{
      textAlign: "center",
    }}
    ref={treeRef}
    id="tree"
  >
    <svg className="svg-content" ref={svgRef}></svg>
  </div>
);

}

const mapStateToProps = (state: ApplicationState) => ({
  pluginStatus: state.plugin.pluginStatus,
  testStatus: state.feed.testStatus,
  isComputeError: state.plugin.computeError,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginInstanceResources: (items: PluginInstance[]) =>
    dispatch(getPluginInstanceResources(items)),
  stopFetchingPluginResources: (id: number) =>
    dispatch(stopFetchingPluginResources(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedTree);











