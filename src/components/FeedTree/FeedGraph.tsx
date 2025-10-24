import type { PluginInstance } from "@fnndsc/chrisapi";
import { Switch, Text } from "@patternfly/react-core";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import ForceGraph2D, {
  type ForceGraphMethods,
  type NodeObject,
} from "react-force-graph-2d";
import { type ITreeChart, TreeModel } from "../../api/model";
import { useAppSelector } from "../../store/hooks";
import { type FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import "./FeedTree.css";
import type { Feed } from "@fnndsc/chrisapi";
import { SpinContainer } from "../Common";
import usePaginatedTreeQuery from "../Feeds/usePaginatedTreeQuery";
import useSize from "./useSize";

interface IFeedProps {
  onNodeClick: (node: PluginInstance) => void;
  currentLayout: boolean;
  changeLayout: () => void;
  feed?: Feed;
}

const FeedGraph: React.FC<IFeedProps> = ({
  onNodeClick,
  currentLayout,
  changeLayout,
  feed,
}) => {
  const { pluginInstances, isLoading: loading } = usePaginatedTreeQuery(feed);
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );

  console.info("FeedGraph: selectedPlugin:", selectedPlugin);
  //const { data: instances, loading } = pluginInstances;
  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const fgRef = React.useRef<ForceGraphMethods>();

  const [nodeScale, setNodeScale] = React.useState<{
    enabled: boolean;
    type: FeedTreeScaleType;
  }>({ enabled: false, type: "time" });

  const size = useSize(graphRef);

  const [graphData, setGraphData] = React.useState<ITreeChart | undefined>(
    undefined,
  );
  const [controls] = React.useState({ "DAG Orientation": "td" });

  const handleNodeClick = (node: NodeObject) => {
    const distance = 40;
    if (
      node.x !== undefined &&
      node.y !== undefined &&
      node.z !== undefined &&
      fgRef.current
    ) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      //@ts-ignore
      fgRef.current.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }, // new position
        node, // lookAt ({ x, y, z })
        3000, // ms transition duration
      );
    }

    if (node.item && typeof node.item === "object") {
      onNodeClick(node.item as PluginInstance);
    }
  };

  React.useEffect(() => {
    if (pluginInstances.length > 0) {
      const tree = new TreeModel(pluginInstances);

      setGraphData(tree.treeChart);
    }
  }, [pluginInstances]);

  return (
    <div className="feed-tree" ref={graphRef}>
      {size && graphData ? (
        <ErrorBoundary
          fallback={
            <Text>
              If you see this message, it means that the graph modules
              weren&apos;t loaded. Please refresh your browser.
            </Text>
          }
        >
          <div className="feed-tree__container--labels feed-graph__container--labels">
            <div className="feed-tree__control feed-tree__individual-scale">
              <Switch
                id="individual-scale"
                label="Scale Nodes On"
                labelOff="Scale Nodes Off"
                isChecked={nodeScale.enabled}
                onChange={() =>
                  setNodeScale({
                    ...nodeScale,
                    enabled: !nodeScale.enabled,
                  })
                }
              />

              {nodeScale.enabled && (
                <div className="dropdown-wrap">
                  <NodeScaleDropdown
                    selected={nodeScale.type}
                    onChange={(type) => setNodeScale({ ...nodeScale, type })}
                  />
                </div>
              )}
            </div>
            <div className="feed-tree__control">
              <Switch
                id="layout"
                label="3D"
                labelOff="2D"
                isChecked={currentLayout}
                onChange={changeLayout}
              />
            </div>
          </div>
          {loading ? (
            <SpinContainer title="Fetching data.." />
          ) : (
            <ForceGraph2D
              height={size.height || 500}
              width={size.width || 500}
              ref={fgRef}
              graphData={graphData}
              //@ts-ignore
              dagMode={controls["DAG Orientation"] as "td" | "lr" | "rl" | "bt"} // Adjust the type as needed
              dagLevelDistance={50}
              backgroundColor="#101020"
              linkColor={() => "rgba(255,255,255,0.2)"}
              nodeVal={
                nodeScale.enabled
                  ? (node: NodeObject) => {
                      if (nodeScale.type === "time") {
                        const instanceData = (node.item as PluginInstance).data;
                        const start = new Date(instanceData?.start_date);
                        const end = new Date(instanceData?.end_date);
                        return Math.log10(end.getTime() - start.getTime()) * 10;
                      }
                      return 1;
                    }
                  : undefined
              }
              onNodeClick={handleNodeClick}
              nodeLabel={(d: NodeObject) =>
                `${(d.item as PluginInstance).data.title || (d.item as PluginInstance).data.plugin_name}`
              }
              nodeAutoColorBy={(d: NodeObject) =>
                selectedPlugin &&
                (d.item as PluginInstance).data.id === selectedPlugin.data.id
                  ? "#fff"
                  : (d.group as string)
              }
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              d3VelocityDecay={0.3}
              linkWidth={2}
              nodeRelSize={3}
            />
          )}
        </ErrorBoundary>
      ) : null}
    </div>
  );
};

export default FeedGraph;
