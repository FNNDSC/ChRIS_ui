import React from "react";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../../../store/hooks";
import { Spinner } from "@patternfly/react-core";
import { setFeedTreeProp, switchTreeMode } from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import FeedTree from "./FeedTree";
import { getFeedTree, TreeNodeDatum, getTsNodes } from "./data";

interface ParentComponentProps {
  onNodeClickTs: (node: PluginInstance) => void;
  onNodeClick: (node: PluginInstance) => void;
  isSidePanelExpanded: boolean;
  isBottomPanelExpanded: boolean;
  onExpand: (panel: string) => void;
}

export type TSID = {
  [key: string]: string[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const {
    onNodeClick,
    onNodeClickTs,
    isSidePanelExpanded,
    isBottomPanelExpanded,
    onExpand,
  } = props;

  const pluginInstances = useTypedSelector(
    (state) => state.feed.pluginInstances
  );
  const feedTreeProp = useTypedSelector((state) => state.feed.feedTreeProp);
  const mode = useTypedSelector((state) => state.feed.treeMode);
  const { data: instances } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[]>([]);
  const [tsIds, setTsIds] = React.useState<TSID>();
  const dispatch = useDispatch();
  console.log("ParentComponent");
  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const data = getFeedTree(instances);
      getTsNodes(instances).then((nodes) => {
        setTsIds(nodes);
      });
      setData(data);
    }
  }, [instances]);

  const changeOrientation = (orientation: string) => {
    dispatch(setFeedTreeProp(orientation));
  };

  const changeMode = (mode: boolean) => {
    dispatch(switchTreeMode(mode));
  };

  return data && data.length > 0 ? (
    <FeedTree
      onNodeClickTs={onNodeClickTs}
      mode={mode}
      data={data}
      tsIds={tsIds}
      onNodeClick={onNodeClick}
      changeMode={changeMode}
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

export default React.memo(ParentComponent);
