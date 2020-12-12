import React, { useEffect, useRef } from "react";
import {connect} from 'react-redux';
import * as cola from "webcola";
import * as d3 from "d3";
import {Spinner} from '@patternfly/react-core'
import {ApplicationState} from '../../../store/root/applicationState'
import {PluginInstancePayload} from '../../../store/feed/types'
import {PluginInstance} from '@fnndsc/chrisapi'
import "./feedTree.scss";
import TreeModel from "../../../api/models/tree.model";



interface ITreeProps {
  pluginInstances:PluginInstancePayload,
  selectedPlugin?:PluginInstance
}

const FeedTree:React.FC<ITreeProps>=({
  pluginInstances,
  selectedPlugin
})=>{
const treeRef=useRef<HTMLDivElement>(null);
const {data:instances, error, loading}=pluginInstances

useEffect(()=>{
if(instances && instances.length>0){
  buildTree(instances)
}

},[instances,selectedPlugin])

const buildTree = (items: PluginInstance[]) => {
  const tree = new TreeModel(items);
  let width = 700,
    height = 300;

  //@ts-ignore
  let color = d3.scaleOrdinal(d3.schemeCategory10);
  let d3cola = cola.d3adaptor(d3).avoidOverlaps(true).size([width, height]);

  let svg = d3
    .select("#tree")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let nodeRadius = 12;

  tree.treeChart.nodes.forEach((v: any) => {
    v.height = v.width = 2 * nodeRadius;
  });

  d3cola
    .nodes(tree.treeChart.nodes)
    .links(tree.treeChart.links)
    .flowLayout("y", 70)
    .symmetricDiffLinkLengths(20)
    .start(10, 15, 20);

  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "end-arrow")
    .attr("viewbox", "0 -5 10 10")
    .attr("refX", 6)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#fff");

  let path = svg
    .selectAll(".link")
    .data(tree.treeChart.links)
    .enter()
    .append("svg:path")
    .attr("class", "link");

  let elemEnter = svg
    .selectAll("g")
    .data(tree.treeChart.nodes)
    .enter()
    .append("g")
    .attr("class", "nodegroup")

    //@ts-ignore
    .style("fill", function (d: any) {
      return color(d.group);
    })
    .call(d3cola.drag);

  let node = elemEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", nodeRadius);

  d3cola.on("tick", function () {
    path.attr("d", function (d: any) {
      let deltaX = d.target.x - d.source.x;
      let deltaY = d.target.y - d.source.y;
      let dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      let normX = deltaX / dist;
      let normY = deltaY / dist;

      let sourcePadding = nodeRadius;
      let targetPadding = nodeRadius + 2;
      let sourceX = d.source.x + sourcePadding * normX;
      let sourceY = d.source.y + sourcePadding * normY;
      let targetX = d.target.x - targetPadding * normX;
      let targetY = d.target.y - targetPadding * normY;
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    });

    node
      .attr("cx", function (d: any) {
        return d.x;
      })
      .attr("cy", function (d: any) {
        return d.y;
      });
  });
};

if(loading){
  return <Spinner size='sm'/>
}

if(error){
  return <div>Oh snap ! Something went wrong. Please refresh your browser</div>
}

return <div ref={treeRef} id="tree"></div>;
}



const mapStateToProps=({feed}:ApplicationState)=>({
pluginInstances:feed.pluginInstances,
selectedPlugin:feed.selectedPlugin
})



export default connect(mapStateToProps)(FeedTree)











