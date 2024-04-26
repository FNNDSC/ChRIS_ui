import { PluginInstance } from "@fnndsc/chrisapi";
import { Switch, Text } from "@patternfly/react-core";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
} from "react-force-graph-2d";
import { connect, useDispatch } from "react-redux";
import { TreeModel } from "../../api/model";
import { setFeedLayout } from "../../store/feed/actions";
import { useTypedSelector } from "../../store/hooks";
import type { PluginInstancePayload } from "../../store/pluginInstance/types";
import { ApplicationState } from "../../store/root/applicationState";
import { FeedTreeScaleType, NodeScaleDropdown } from "./Controls";
import "./FeedTree.css";
import useSize from "./useSize";

interface IFeedProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  onNodeClick: (node: PluginInstance) => void;
}

const FeedGraph = (props: IFeedProps) => {
  const dispatch = useDispatch();
  const currentLayout = useTypedSelector((state) => state.feed.currentLayout);
  const { pluginInstances, selectedPlugin, onNodeClick } = props;
  const { data: instances } = pluginInstances;
  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const fgRef = React.useRef<ForceGraphMethods | undefined>();

  const [nodeScale, setNodeScale] = React.useState<{
    enabled: boolean;
    type: FeedTreeScaleType;
  }>({ enabled: false, type: "time" });

  const size = useSize(graphRef);

  const [graphData, setGraphData] = React.useState();
  const [controls] = React.useState({ "DAG Orientation": "td" });

  const handleNodeClick = (node: NodeObject) => {
    const distance = 40;
    if (node?.x && node.y && node.z && fgRef.current) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      //@ts-ignore
      fgRef.current.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }, // new position
        //@ts-ignore
        node, // lookAt ({ x, y, z })
        3000, // ms transition duration
      );
    }

    //@ts-ignore
    onNodeClick(node.item);
  };

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const tree = new TreeModel(instances);

      //@ts-ignore
      setGraphData(tree.treeChart);
    }
  }, [instances]);

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
                  setNodeScale({ ...nodeScale, enabled: !nodeScale.enabled })
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
                label="2D"
                labelOff="2D"
                isChecked={currentLayout}
                onChange={() => {
                  dispatch(setFeedLayout());
                }}
              />
            </div>
          </div>
          <>
            <ForceGraph2D
              //@ts-ignore
              height={size.height || 500}
              //@ts-ignore
              width={size.width || 500}
              ref={fgRef}
              graphData={graphData}
              //@ts-ignore
              dagMode={controls["DAG Orientation"]}
              dagLevelDistance={50}
              backgroundColor="#101020"
              linkColor={() => "rgba(255,255,255,0.2)"}
              nodeVal={
                nodeScale.enabled
                  ? (node: any) => {
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
              nodeLabel={(d: any) => {
                return `${d.item.data.title || d.item.data.plugin_name}`;
              }}
              nodeAutoColorBy={(d: any) => {
                if (
                  selectedPlugin &&
                  d.item.data.id === selectedPlugin.data.id
                ) {
                  return "#fff";
                }
                return d.group;
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              d3VelocityDecay={0.3}
              linkWidth={2}
              nodeRelSize={8}
            />
          </>
        </ErrorBoundary>
      ) : (
        <Text>Fetching the Graph....</Text>
      )}
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstances: state.instance.pluginInstances,
  selectedPlugin: state.instance.selectedPlugin,
});

const FeedGraphConnect = connect(mapStateToProps, {})(FeedGraph);

export default FeedGraphConnect;
