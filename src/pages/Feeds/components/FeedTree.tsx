import React, { createRef, Component } from "react";
import * as d3 from "d3"; // import * as d3v4 from "d3v4";
import * as cola from 'webcola';

interface ITreeProps {
    items: Array<any>;
    // Add more props as needed
};

interface ITreeActions {
    onNodeClick:(node:any)=> void;
};

type AllProps = ITreeProps & ITreeActions;

class FeedTree extends React.Component<AllProps> {
    private treeRef = createRef<HTMLDivElement>();
    componentDidMount() {
        const { items } = this.props;
        (!!this.treeRef.current && !!items && items.length > 0) && this.buildWebcolaTree(items, this.treeRef)
    }

    public render() {
        const { items } = this.props;
        return (
            <div ref={this.treeRef} id="tree" ></div>
        )
    }

    componentWillUnmount() {
        d3.select("#tree").remove(); // Destroy d3 content
    }

    // Charting:
    // ---------------------------------------------------------------------
    // Description: Builds Webcola/D3 tree  ***** Working ***** //
    buildWebcolaTree = (items: any[], treeDiv: any) => {
        const { onNodeClick } = this.props;
        const _self =this;
        const width = treeDiv.current.clientWidth > 0 ? treeDiv.current.clientWidth : (window.innerWidth / 2 - 290),
            height = 300; // Need to calculate SVG height ***** working
        
        const d3cola = cola.d3adaptor(d3)
            .avoidOverlaps(true)
            .size([width, height]);

        const svg = d3.select("#tree").append("svg")
            .attr("width", width)
            .attr("height", height);

        d3.json("/mockData/sampleWebcola.json").then(function (graph: any) {
            const nodeRadius = 8;
            graph.nodes.forEach(function (v: any) {
                v.height = v.width = 2 * nodeRadius;
            });

            d3cola
                .nodes(graph.nodes)
                .links(graph.links)
                .flowLayout("y", 70) // https://ialab.it.monash.edu/webcola/doc/classes/cola.layout.html#flowlayout
                .symmetricDiffLinkLengths(15) //compute an ideal length for each link based on the graph structure around that link.
                .start(10, 15, 20);

            // Define arrow markers for graph links
            svg
                .append('svg:defs')
                .append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 6)
                .attr('markerWidth', 5)
                .attr('markerHeight', 5)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', '#fff');
        
            // Define graph links
            const path = svg.selectAll(".link")
                .data(graph.links)
                .enter()
                .append('svg:path')
                .attr('class', 'link');

            // Define graph nodes
            const node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("circle")
                .on("click", onNodeClick) // Trigger to load node information on the right panel
                .attr("class", "node")
                .attr("r", nodeRadius)
                .call(d3cola.drag);

            // Build the node title and tooltip
            node.append("title")
                .text(function (d: any) {
                    const title = `plugin_name: ${d.plugin_name} / id: ${d.id} / previous_id: ${d.previous_id || 'None - this is the root node'}`;
                    return title;
                });

            d3cola.on("tick", function () {
                // draw directed edges with proper padding from node centers
                path.attr('d', function (d: any) {
                    const deltaX = d.target.x - d.source.x,
                        deltaY = d.target.y - d.source.y,
                        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                        normX = deltaX / dist,
                        normY = deltaY / dist,
                        sourcePadding = nodeRadius + 5,
                        targetPadding = nodeRadius + 10,
                        sourceX = d.source.x + (sourcePadding * normX),
                        sourceY = d.source.y + (sourcePadding * normY),
                        targetX = d.target.x - (targetPadding * normX),
                        targetY = d.target.y - (targetPadding * normY);
                    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
                });
                
                // path.attr("stroke-dasharray", "5, 5") // For dashed lines
                node.attr("cx", function (d: any) { return d.x; }).attr("cy", function (d: any) { return d.y; });
            });
        });
    }

}

export default FeedTree;