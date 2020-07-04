import React, { createRef } from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import TreeModel, { ITreeChart } from "../../api/models/tree.model";
import TreeNodeModel, { INode } from "../../api/models/tree-node.model";
import { getPluginInstanceTitle } from "../../api/models/pluginInstance.model";
import { PluginInstance } from "@fnndsc/chrisapi";
import * as _ from "lodash";
interface ITreeProps {
  selected: PluginInstance;
  items: PluginInstance[];
}

class PipelineTree extends React.Component<ITreeProps> {
  private treeRef = createRef<HTMLDivElement>();
  componentDidMount() {
    const { items } = this.props;
    this.updateTree(items); // Needed for the onload
  }

  render() {
    const { items } = this.props;
    !!this.treeRef.current &&
      !!items &&
      items.length > 0 &&
      this.updateTree(items);
    return (
      <div ref={this.treeRef} id="pipelineTree">
        <div id="pTooltip" className="tooltip" />
      </div>
    );
  }
  // Description: Build the tree from items passed to the component
  updateTree(items: PluginInstance[]) {
    const { selected } = this.props;
    !!d3 && d3.select("#pipelineTree").selectAll("svg").remove();
    const _items = TreeNodeModel.isRootNode(selected) ? [selected] : items;
    const tree = new TreeModel(_items, selected.data.previous_id);
    !!tree.treeChart && this.buildPipelineTree(tree.treeChart, this.treeRef);
  }

  // ---------------------------------------------------------------------
  // Description: Builds Webcola/D3 Feed Tree
  buildPipelineTree = (
    tree: ITreeChart,
    treeDiv: React.RefObject<HTMLDivElement>
  ) => {
    const labelMaxChar = 12;
    const width =
        !!treeDiv.current && treeDiv.current.clientWidth > 0
          ? treeDiv.current.clientWidth
          : window.innerWidth / 2 - 290,
      height = TreeNodeModel.calculateTotalTreeHeight(tree.totalRows); // Need to calculate SVG height ***** working

    const d3cola = cola.d3adaptor(d3).avoidOverlaps(true).size([width, height]);

    const svg = d3
      .select("#pipelineTree")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const nodeRadius = 8;
    tree.nodes.forEach((v: any) => {
      v.height = v.width = 2 * nodeRadius;
      const label = getPluginInstanceTitle(v.data.item);
      v.label =
        label.length > labelMaxChar
          ? `${label.substring(0, labelMaxChar)}...`
          : label;
    });

    // Set up Webcola
    d3cola
      .nodes(tree.nodes)
      .links(tree.links)
      .flowLayout("y", 70)
      .symmetricDiffLinkLengths(20)
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
      .data(tree.links)
      .enter()
      .append("svg:path")
      .attr("class", "link");

    // Create and place the "blocks" containing the circle and the text
    const elemEnter = svg
      .selectAll("g")
      .data(tree.nodes)
      .enter()
      .append("g")
      .attr("id", (d: any) => {
        return `node_${d.item.id}`; // set the node id using the plugin id
      })
      .attr("class", (d: INode) => {
        return `nodegroup ${d.isRoot && "active"}`; // set the node id using the plugin id
      })
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
      .attr("r", nodeRadius)
      .on("mouseover", this.handleMouseOver)
      .on("mouseout", this.handleMouseOut);

    // Move links and nodes together
    d3cola.on("tick", () => {
      // draw directed edges with proper padding from node centers
      path.attr("d", (d: any) => {
        const deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = nodeRadius + 25,
          targetPadding = nodeRadius + 10,
          sourceX = d.source.x + sourcePadding * normX,
          sourceY = d.source.y + sourcePadding * normY,
          targetX = d.target.x - targetPadding * normX,
          targetY = d.target.y - targetPadding * normY;
        return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      });

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
        return `translate(${d.x - nodeRadius * 2}, ${d.y + nodeRadius * 2.5} )`;
      });
    }); // end of on tick
  };

  handleMouseOver = (d: any, i: number) => {
    const tooltip = document.getElementById("pTooltip");
    const tooltipWidth = 200;
    if (!!tooltip) {
      const title = `Plugin Name: ${d.item.data.plugin_name}`;
      tooltip.innerHTML = title;
      const height = tooltip.offsetHeight;
      tooltip.style.width = tooltipWidth + "px";
      tooltip.style.opacity = "1";
      tooltip.style.left = d.x - tooltipWidth * 0.5 + "px";
      tooltip.style.top = d.y - (height + 25) + "px";
    }
  };

  handleMouseOut = (d: any, i: number) => {
    const tooltip = document.getElementById("pTooltip");
    if (!!tooltip) {
      tooltip.innerHTML = "";
      tooltip.style.opacity = "0";
      tooltip.style.left = "-9999px";
    }
  };

  // Description: Destroy d3 content
  componentWillUnmount() {
    !!d3 && d3.select("#pipelineTree").remove();
  }
}

export default PipelineTree;
