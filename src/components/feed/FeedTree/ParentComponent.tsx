import React from "react";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";
import { Spinner } from "@patternfly/react-core";
import { setFeedTreeProp } from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import FeedTree from "./FeedTree";
import { getFeedTree, TreeNodeDatum } from "./data";

interface ParentComponentProps {
  onNodeClick: (node: PluginInstance) => void;
  isSidePanelExpanded: boolean;
  isBottomPanelExpanded: boolean;
  onExpand: (panel: string) => void;
}

const ParentComponent = (props: ParentComponentProps) => {
  const {
    onNodeClick,
    isSidePanelExpanded,
    isBottomPanelExpanded,
    onExpand,
  } = props;

  const pluginInstances = useTypedSelector(
    (state) => state.feed.pluginInstances
  );
  const feedTreeProp = useTypedSelector((state) => state.feed.feedTreeProp);
  const { data: instances } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[]>([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const data = getFeedTree(instances);
      setData(data);
    }
  }, [instances]);

  const changeOrientation = (orientation: string) => {
    dispatch(setFeedTreeProp(orientation));
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
      isSidePanelExpanded={isSidePanelExpanded}
      isBottomPanelExpanded={isBottomPanelExpanded}
      onExpand={onExpand}
    />
  ) : (
    <Spinner size="lg" />
  );
};

export default ParentComponent;
