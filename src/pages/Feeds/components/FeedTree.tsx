import React, { createRef } from "react";
import * as d3 from "d3";
import * as cola from "webcola";

interface ITreeProps {
  items: any[];
}

interface ITreeActions {
  onNodeClick: (node: any) => void;
}

type AllProps = ITreeProps & ITreeActions;

class FeedTree extends React.Component<AllProps> {
  private treeRef = createRef<HTMLDivElement>();
  componentDidMount() {
    const { items } = this.props;
    (!!this.treeRef.current && !!items && items.length > 0) && this.buildFeedTree(items, this.treeRef);
  }

  render() {
    const { items } = this.props;

    return <div ref={this.treeRef} id="tree" />;
  }

  // ---------------------------------------------------------------------
  // Description: Builds Webcola/D3 Feed Tree
    buildFeedTree = (items: any[], treeDiv: any) => {
        const width =
            treeDiv.current.clientWidth > 0
            ? treeDiv.current.clientWidth
            : window.innerWidth / 2 - 290,
        height = 300; // Need to calculate SVG height ***** working

        const d3cola = cola
        .d3adaptor(d3)
        .avoidOverlaps(true)
        .size([width, height]);

        const svg = d3
        .select("#tree")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

        // Description: trigger the color change and then Load node information
        // Need to add "active class to node" - find the right node first:
        const nodeClick = (node: any) => {
        const { onNodeClick } = this.props;
        d3.selectAll(".nodegroup.active").attr("class", "nodegroup");
        const activeNode = d3.select(`#node_${node.id}`);
        if (!!activeNode && !activeNode.empty()) {
            activeNode.attr("class", "nodegroup active");
            onNodeClick(node);
        }
        };


        // Description: Build tree
        d3.json("/mockData/sampleWebcola.json").then((graph: any) => {
        const nodeRadius = 8;
        graph.nodes.forEach((v: any) => {
            v.height = v.width = 2 * nodeRadius;
            v.label = v.plugin_name.length > 7 ? `${v.plugin_name.substring(0, 7)}...` : v.plugin_name;
        });

        d3cola
            .nodes(graph.nodes)
            .links(graph.links)
            .flowLayout("y", 70)
            .symmetricDiffLinkLengths(20)
            .start(10, 15, 20);

        // Define arrow markers for graph links
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

        // Define graph links
        const path = svg
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("svg:path")
            .attr("class", "link");

        // Create and place the "blocks" containing the circle and the text
        const elemEnter = svg
            .selectAll("g")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("id", (d: any) => {return `node_${d.id}`; })
            .attr("class", "nodegroup")
            .on("click", nodeClick)
            .call(d3cola.drag);

        // Define graph nodes
        const node = elemEnter
            .append("circle")
            .attr("class", "node")
            .attr("r", nodeRadius);

        const label = elemEnter
            .append("text")
            .text((d: any) => { return d.label; })
            .attr("class", "nodelabel");

        // Build the node title and tooltip
        node.append("title").text((d: any) => {
            const title = `plugin_name: ${d.plugin_name} / id: ${
            d.id
            } / previous_id: ${d.previous_id || "None - this is the root node"}`;
            return title;
        });

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

            // Position labels:
            label.attr("transform", (d: any) => {
            return `translate(${d.x - nodeRadius * 2}, ${d.y +
                nodeRadius * 2.5} )`;
            });
        }); // end of on tick
        });
    }

    // Description: Destroy d3 content
    componentWillUnmount() {
        d3.select("#tree").remove();
    }
}

export default FeedTree;
