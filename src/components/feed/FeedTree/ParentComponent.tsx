import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Spinner } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import { PluginInstancePayload, FeedTreeProp } from "../../../store/feed/types";
import { setFeedTreeProp } from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import FeedTree from "./FeedTree";
import { getFeedTree, TreeNodeDatum } from "./data";

interface ParentComponentProps {
  pluginInstances: PluginInstancePayload;
  onNodeClick: (node: PluginInstance) => void;
  feedTreeProp: FeedTreeProp;
  setFeedTreeProp: (orientation: string) => void;
  isPanelExpanded: boolean;
  onExpand: () => void;
}

const ParentComponent = (props: ParentComponentProps) => {
  const {
    onNodeClick,
    pluginInstances,
    feedTreeProp,
    setFeedTreeProp,
    isPanelExpanded,
    onExpand,
  } = props;
  const { data: instances } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[]>([]);

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const data = getFeedTree(instances);
      setData(data);
    }
  }, [instances]);

  const changeOrientation = (orientation: string) => {
    setFeedTreeProp(orientation);
  };

  return data && data.length > 0 ? (
    <FeedTree
      data={data}
      onNodeClick={onNodeClick}
      zoom={1}
      nodeSize={{ x: 85, y: 60 }}
      separation={
        instances && instances.length > 30
          ? {
              siblings: 0.5,
              nonSiblings: 0.5,
            }
          : {
              siblings: 1.0,
              nonSiblings: 2.0,
            }
      }
      feedTreeProp={feedTreeProp}
      instances={instances}
      changeOrientation={changeOrientation}
      isPanelExpanded={isPanelExpanded}
      onExpand={onExpand}
    />
  ) : (
    <Spinner size="lg" />
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstances: state.feed.pluginInstances,
  feedTreeProp: state.feed.feedTreeProp,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setFeedTreeProp: (orientation: string) =>
    dispatch(setFeedTreeProp(orientation)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ParentComponent);
