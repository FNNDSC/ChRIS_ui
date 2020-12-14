import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import * as d3 from "d3";
import * as cola from "webcola";
import {Spinner} from '@patternfly/react-core'
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  PluginInstancePayload,
  PluginInstanceResourcePayload,
} from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import TreeModel from "../../../api/models/tree.model";
import "./feedTree.scss";


interface ITreeProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  pluginInstanceResource: PluginInstanceResourcePayload;
}

const FeedTree: React.FC<ITreeProps> = ({
  pluginInstances,
  selectedPlugin,
  pluginInstanceResource
}) => {
  const treeRef = useRef<HTMLDivElement>(null);
  const { data: instances, error, loading } = pluginInstances;
  console.log("Feed Tree:", pluginInstanceResource, instances,
  selectedPlugin
  );

  const buildTree = React.useCallback(

    (items: PluginInstance[]) => {
      console.log('Build Tree called')
      const tree = new TreeModel(items);

      let dimensions = { height: 350, width: 700 };
      if (instances?.length === 2) {
        dimensions.height = 300;
      }

      const d3cola = cola
        .d3adaptor(d3)
        .avoidOverlaps(true)
        .size([dimensions.width + 100, dimensions.height + 30]);

      d3.select("#tree").selectAll("svg").remove();

     const svg = d3
        .select("#tree")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

      const nodeRadius = 10;
      tree.treeChart.nodes.forEach((v: any) => {
        v.height = v.width = 2 * nodeRadius;
        const label = `${v.item.data.plugin_name}`;
        v.label = label;
      });

      // Set up Webcola
      d3cola
        .nodes(tree.treeChart.nodes)
        .links(tree.treeChart.links)
        .flowLayout("y", 70)
        .symmetricDiffLinkLengths(30)
        .start(10, 15, 20);

      // Define arrow markers for tree links
      svg
        .append("svg:defs")
        .append("svg:marker")
        .attr("id", "end-arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 6)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#fff");

      // Define tree links
      const path = svg
        .selectAll(".link")
        .data(tree.treeChart.links)
        .enter()
        .append("svg:path")
        .attr("class", "link")
      

      // Create and place the "blocks" containing the circle and the text
      const elemEnter = svg
        .selectAll("g")
        .data(tree.treeChart.nodes)
        .enter()
        .append("g")
        .attr("id", (d: any) => {
          return `node_${Number(d.item.data.id)}`;
        })
        .attr("class", "nodegroup")
        .call(d3cola.drag);

      const label = elemEnter
        .append("text")
        .text((d: any) => {
          return d.label;
        })
        .attr("class", "nodelabel");

      // Define tree nodes
      const node = elemEnter
        .append("circle")
        .attr("class", "node")
        .attr("r", nodeRadius);

      // Move links and nodes together
      d3cola.on("tick", () => {
        // draw directed edges with proper padding from node centers
        path.attr("d", (d: any) => {
          const deltaX = d.target.x - d.source.x,
            deltaY = d.target.y - d.source.y,
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
            normX = deltaX / dist,
            normY = deltaY / dist,
            sourcePadding = nodeRadius,
            targetPadding = nodeRadius + 2,
            sourceX = d.source.x + sourcePadding * normX,
            sourceY = d.source.y + sourcePadding * normY,
            targetX = d.target.x - targetPadding * normX,
            targetY = d.target.y - targetPadding * normY;
          return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
        });

        // path.attr("stroke-dasharray", "5, 5") // For dashed lines
        // Position the nodes:
        node
          .attr("cx", (d: any) => {
            return d.x;
          })
          .attr("cy", (d: any) => {
            return d.y;
          });

        // Position labels and tooltip:
        label.attr("transform", (d: any) => {
          return `translate(${d.x - nodeRadius * 4}, ${
            d.y + nodeRadius * 2.5
          } )`;
        });
      }); // end of on tick


      const errorNode=instances?.filter((node)=>{
        return node.data.status==='finishedWithError'
      })

      const queuedNode=instances?.filter(node=>{
        return node.data.status==='waitingForPrevious'
      })

      const successNode=instances?.filter(node=>{
        return node.data.status==='finishedSuccessfully'
      })

      if (errorNode &&errorNode.length > 0) {
        errorNode.forEach(function (node) {
          const d3errorNode = d3.select(`#node_${node.data.id}`);
          if (!!d3errorNode && !d3errorNode.empty()) {
            d3errorNode.attr("class",'nodegroup error');
          }
        });
      }

      if (queuedNode && queuedNode.length > 0) {
        queuedNode.forEach(function (node) {
          const d3QueuedNode = d3.select(`#node_${node.data.id}`);
          if (!!d3QueuedNode && !d3QueuedNode.empty()) {
            d3QueuedNode.attr("class", `nodegroup queued`);
          }
        });
      }

      if (successNode && successNode.length > 0) {
        successNode.forEach(function (node) {
          const d3SuccessNode = d3.select(`#node_${node.data.id}`);
          if (!!d3SuccessNode && !d3SuccessNode.empty()) {
            d3SuccessNode.attr(
              "class", `nodegroup success `
            );
          }
        });
      }
     
    },

    
    [selectedPlugin,instances, pluginInstanceResource]
  );


  useEffect(() => {
    if (instances && instances.length > 0) {
      buildTree(instances);
    }
  }, [instances, selectedPlugin, buildTree]);

  

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
    ></div>
  );
};


const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: state.feed.pluginInstanceResource,
  pluginInstances: state.feed.pluginInstances,
  selectedPlugin: state.feed.selectedPlugin,
});



export default connect(mapStateToProps, {})(FeedTree);











