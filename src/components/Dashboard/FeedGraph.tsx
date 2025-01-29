// src/components/FeedGraph.tsx

import React from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import useSize from "../FeedTree/useSize";

const FeedGraph = ({ graphData }: any) => {
  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const fgRef = React.useRef<ForceGraphMethods | undefined>();
  const size = useSize(graphRef);
  const [controls] = React.useState({ "DAG Orientation": "td" });

  // Define constants for node and label styling
  const NODE_SIZE = 2;
  const LABEL_FONT_SIZE = 10; // Base font size
  const LABEL_COLOR = "#ffffff"; // White color for labels
  const LABEL_OFFSET_Y = -10; // Y-axis offset for label positioning

  return (
    <div className="feed-tree" ref={graphRef}>
      <ForceGraph2D
        height={size?.height || 300}
        width={size?.width || 300}
        ref={fgRef}
        graphData={graphData}
        //@ts-ignore
        dagMode={controls["DAG Orientation"]}
        dagLevelDistance={20}
        backgroundColor="#101020"
        linkColor={() => "rgba(255,255,255,0.2)"}
        nodeAutoColorBy={(d: any) => d.group}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        d3VelocityDecay={1}
        linkWidth={1}
        nodeRelSize={NODE_SIZE}
        // Remove nodeLabel as labels will be drawn on the canvas
        // nodeLabel={(d: any) => `${d.item.data.title || d.item.data.plugin_name}`}
        // Custom node rendering to include labels
        nodeCanvasObject={(
          node: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number,
        ) => {
          const label = node.item.data.title || node.item.data.plugin_name;

          // Calculate font size based on zoom level
          const fontSize = LABEL_FONT_SIZE / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = LABEL_COLOR;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Draw node as a circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || "#ffffff"; // Default to white if no color
          ctx.fill();

          // Draw label above the node
          ctx.fillText(label, node.x, node.y + LABEL_OFFSET_Y);
        }}
        // Optional: Improve node interactivity by expanding the pointer area
        nodePointerAreaPaint={(
          node: any,
          color: string,
          ctx: CanvasRenderingContext2D,
        ) => {
          const label = node.item.data.title || node.item.data.plugin_name;
          const fontSize = LABEL_FONT_SIZE / 2;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, node.x, node.y + LABEL_OFFSET_Y);
        }}
      />
    </div>
  );
};

export default FeedGraph;
