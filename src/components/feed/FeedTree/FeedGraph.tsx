import React, {MutableRefObject} from "react";
import { connect } from "react-redux";
import ForceGraph3D, {NodeObject, ForceGraphMethods} from "react-force-graph-3d";
import { PluginInstancePayload } from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import useResizeObserver from '@react-hook/resize-observer';
import TreeModel from '../../../api/models/tree.model'
import {PluginInstance} from '@fnndsc/chrisapi'
import {ErrorBoundary} from "react-error-boundary";
import {Text} from '@patternfly/react-core'
import './FeedTree.scss';



interface IFeedProps {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  onNodeClick: (node: PluginInstance) => void;
}


const useSize=(target:MutableRefObject<HTMLDivElement | null>)=>{
  const [size, setSize] = React.useState();

  React.useLayoutEffect(() => {
    //@ts-ignore
    setSize(target.current?.getBoundingClientRect());
  }, [target]);
  //@ts-ignore
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
}

const FeedGraph = (props: IFeedProps) => {
  const { pluginInstances, selectedPlugin, onNodeClick } = props;
  const { data: instances } = pluginInstances;
  const graphRef = React.useRef<HTMLDivElement | null>(null);
  const fgRef = React.useRef<ForceGraphMethods | undefined>();

  const size = useSize(graphRef);

  const [graphData, setGraphData] = React.useState();

  const handleNodeClick = (node: NodeObject) => {
    const distance = 40;
    if (node && node.x && node.y && node.z && fgRef.current) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        }, // new position
        //@ts-ignore
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
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
          <ForceGraph3D
            ref={fgRef}
            //@ts-ignore
            height={size.height || 500}
            //@ts-ignore
            width={size.width || 500}
            graphData={graphData}
            nodeAutoColorBy={(d: any) => {
              if (selectedPlugin && d.item.data.id === selectedPlugin.data.id) {
                return "#fff";
              }
              return d.group;
            }}
            onNodeClick={handleNodeClick}
            nodeLabel={(d: any) => {
              return `${d.item.data.title || d.item.data.plugin_name}`;
            }}
            linkWidth={2}
          />
        </ErrorBoundary>
      ) : (
        <Text>Fetching the Graph....</Text>
      )}
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstances: state.feed.pluginInstances,
  selectedPlugin: state.feed.selectedPlugin,
});

export default connect(mapStateToProps, {})(FeedGraph);
