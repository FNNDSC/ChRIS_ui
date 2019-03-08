import React, { createRef, RefObject } from "react";
import * as d3 from "d3";
import * as cola from "webcola";
import TreeModel, { ITreeChart } from "../../api/models/tree.model";
import TreeNodeModel, { INode } from "../../api/models/tree-node.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";

interface ITreeProps {
  items: IPluginItem[];
}

interface ITreeActions {
  onNodeClick: (node: any) => void;
}

type AllProps = ITreeProps & ITreeActions;

class FeedTree extends React.Component<AllProps> {
  private treeRef = createRef<HTMLDivElement>();
  componentDidMount() {
    const { items } = this.props;
    if (!!this.treeRef.current && !!items && items.length > 0) {
      const tree = new TreeModel(items);
      if (!!tree.treeChart) {
        this.buildFeedTree(tree.treeChart, this.treeRef);
        // Set root node active on load:
        tree.treeChart.nodes.length > 0 &&
          this.setActiveNode(tree.treeChart.nodes[0]);
      }
    }
  }

  render() {
    return (
      <div ref={this.treeRef} id="tree">
        <div id="tooltip" className="tooltip" />
      </div>
    );
  }

  // Description: set active node
  setActiveNode = (node: INode) => {
    const { onNodeClick } = this.props;
    d3.selectAll(".nodegroup.active").attr("class", "nodegroup");
    const activeNode = d3.select(`#node_${node.item.id}`);
    if (!!activeNode && !activeNode.empty()) {
      activeNode.attr("class", "nodegroup active");
      onNodeClick(node.item);
    }
  }

  // ---------------------------------------------------------------------
  // Description: Builds Webcola/D3 Feed Tree
  buildFeedTree = (
    tree: ITreeChart,
    treeDiv: React.RefObject<HTMLDivElement>
  ) => {
    const width =
        !!treeDiv.current && treeDiv.current.clientWidth > 0
          ? treeDiv.current.clientWidth
          : window.innerWidth / 2 - 290,
      height = TreeNodeModel.calculateTotalTreeHeight(tree.totalRows);

    const d3cola = cola
      .d3adaptor(d3)
      .avoidOverlaps(true)
      .size([width, height]);

    const svg = d3
      .select("#tree")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const nodeRadius = 8;
    tree.nodes.forEach((v: any) => {
      v.height = v.width = 2 * nodeRadius;
      v.label =
        v.item.plugin_name.length > 7
          ? `${v.item.plugin_name.substring(0, 7)}...`
          : v.item.plugin_name;
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
        // set the node id using the plugin id
        return `node_${d.item.id}`;
      })
      .attr("class", "nodegroup")
      .on("click", this.setActiveNode)
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
        return `translate(${d.x - nodeRadius * 2}, ${d.y + nodeRadius * 2.5} )`;
      });
    }); // end of on tick
  }

  handleMouseOver = (d: any, i: number) => {
    const tooltip = document.getElementById("tooltip");
    const tooltipWidth = 200;
    if (!!tooltip) {
      const title = `Plugin Name: ${d.item.plugin_name}`;
      tooltip.innerHTML = title;
      const height = tooltip.offsetHeight;
      tooltip.style.width = tooltipWidth + "px";
      tooltip.style.opacity = "1";
      tooltip.style.left = (d.x - tooltipWidth * 0.5) + "px";
      tooltip.style.top = (d.y - (height + 25)) + "px";
    }
  }

  handleMouseOut = (d: any, i: number) => {
    const tooltip = document.getElementById("tooltip");
    if (!!tooltip) {
      tooltip.innerHTML = "";
      tooltip.style.opacity = "0";
      tooltip.style.left = "-9999px";
    }
  }

  // Description: Destroy d3 content
  componentWillUnmount() {
    !!d3 && d3.select("#tree").remove();
  }
}

export default FeedTree;
