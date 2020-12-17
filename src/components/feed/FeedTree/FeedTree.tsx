import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";

import {select, tree, stratify} from 'd3'
import {Spinner} from '@patternfly/react-core'
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  PluginInstancePayload,
  ResourcePayload,
} from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import "./feedTree.scss";
import {
  getSelectedInstanceResource } from "../../../store/feed/selector";


interface ITreeProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  pluginInstanceResource: ResourcePayload;
  
}

interface OwnProps {
  onNodeClick:(node:PluginInstance)=>void;
}

const FeedTree: React.FC<ITreeProps & OwnProps> = ({
  pluginInstances,
  selectedPlugin,
  pluginInstanceResource,
  onNodeClick
}) => {
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginLog;
  const treeRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: instances, error, loading } = pluginInstances;

  const handleNodeClick = React.useCallback(
    (node: any) => {
      onNodeClick(node.data);
    },
    [onNodeClick]
  );


  const buildTree = React.useCallback(
    (instances: PluginInstance[]) => {
      console.log("Build Tree")
      
      let dimensions = { height: 300, width: 700 };
      select("#tree").selectAll("svg").selectAll("g").remove();
      let svg = select(svgRef.current)
        .attr("width", `${dimensions.width + 100}`)
        .attr("height", `${dimensions.height + 100}`);


      const errorNode = instances.filter((node) => {
            return (
              node.data.status === "finishedWithError" || node.data.status==='cancelled'
            );
          });

      const activeNode = instances.filter((node) => {
        return (
          node.data.status === "started" ||
          node.data.status === "scheduled" ||
          node.data.status === "registeringFiles"
        );
      });

      const queuedNode = instances.filter((node) => {
        return node.data.status === "waitingForPrevious";
      });

      const successNode = instances.filter((node) => {
        return node.data.status === "finishedSuccessfully";
      });

      

    
      let graph = svg.append("g").attr("transform", "translate(50,50)");
      graph.selectAll(".node").remove();
      graph.selectAll(".link").remove();
      const stratified = stratify()
        .id((d: any) => d.data.id)
        .parentId((d: any) => d.data.previous_id);
      const root = stratified(instances);
      let d3TreeLayout = tree();
      d3TreeLayout.size([dimensions.width, dimensions.height]);
      d3TreeLayout(root);

      let nodeRadius = 12;

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

      graph
        .append("svg:defs")
        .append("svg:marker")
        .attr("id", "end-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 6)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#fff");

      // Links

      graph
        .selectAll(".link")
        .data(root.links())
        .join("path")
        // @ts-ignore
        .attr("d", function (d: any) {
          const deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = nodeRadius,
            targetPadding = nodeRadius + 4,
            sourceX = d.source.x + sourcePadding * normX,
            sourceY = d.source.y + sourcePadding * normY,
            targetX = d.target.x - targetPadding * normX,
            targetY = d.target.y - targetPadding * normY;
          return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        })
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

        .attr("fill", "#fff")
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .attr("opacity", 1)
        .attr("transform", (d: any) => {
          return `translate(${d.x - nodeRadius * 2}, ${
            d.y + nodeRadius * 2.5
          } )`;
        });

     

      
       if (errorNode.length > 0) {
         errorNode.forEach(function (node) {
           const d3errorNode = select(`#node_${node.data.id}`);
           if (!!d3errorNode && !d3errorNode.empty()) {
             d3errorNode.attr("class", `node error`);
           }
         });
       }

      if (activeNode.length > 0) {
        activeNode.forEach(function (node) {
          const d3activeNode = select(`#node_${node.data.id}`);
          if (!!d3activeNode && !d3activeNode.empty()) {
            d3activeNode.attr("class", `node active`);
          }
        });
      }

  
      if (queuedNode.length > 0) {
        queuedNode.forEach(function (node) {
          const d3QueuedNode = select(`#node_${node.data.id}`);

          if (!!d3QueuedNode && !d3QueuedNode.empty()) {
            d3QueuedNode.attr("class", `node queued `);
          }
        });
      }

      if (successNode.length > 0) {
        successNode.forEach(function (node) {
          const d3SuccessNode = select(`#node_${node.data.id}`);

          if (!!d3SuccessNode && !d3SuccessNode.empty()) {
            d3SuccessNode.attr("class", `node success `);
          }
        });
      }
      
    },
    
   [handleNodeClick]
  );


  useEffect(() => {
    if (instances && instances.length > 0) {
      buildTree(instances);
    }
  }, [
    instances,
    selectedPlugin,
    buildTree,
    pluginStatus,
   
  ]);

  
  if (loading) {
    return <Spinner size="sm" />;
  }

  if (error) {
    return (
      <div>Oh snap ! Something went wrong. Please refresh your browser</div>
    );
  }

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
};


const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: getSelectedInstanceResource(state),
  pluginInstances: state.feed.pluginInstances,
  selectedPlugin: state.feed.selectedPlugin,
});


export default connect(mapStateToProps, {})(FeedTree);












