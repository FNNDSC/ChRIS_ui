import React from "react";
import { connect } from "react-redux";
import { hierarchy } from "d3-hierarchy";
import { create } from "d3-selection";
import { PluginInstancePayload } from "../../../store/feed/types";
import { ApplicationState } from "../../../store/root/applicationState";
import { getFeedTree, TreeNodeDatum } from "./data";
import { forceSimulation } from "d3-force";

interface IFeedProps {
  pluginInstances: PluginInstancePayload;
}

const FeedGraph = (props: IFeedProps) => {
  const { pluginInstances } = props;
  const { data: instances } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[] | undefined>();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const generateTree = () => {
    let nodes;
    let links;
    if (data) {
      const root = hierarchy(data[0]);
      links = root.links();
      nodes = root.descendants();
    }

    //@ts-ignore
    const simulation = forceSimulation(nodes);

    return { nodes, links };
  };

  generateTree();

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const tree = getFeedTree(instances);
      setData(tree);
    }
  }, [instances]);

  return <div ref={containerRef}></div>;
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstances: state.feed.pluginInstances,
});

export default connect(mapStateToProps, {})(FeedGraph);
