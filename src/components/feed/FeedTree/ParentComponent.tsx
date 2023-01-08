import React from "react";
import { useDispatch } from "react-redux";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { setFeedTreeProp } from "../../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import FeedTree from "./FeedTree";
import { getFeedTree, TreeNodeDatum, getTsNodes } from "./data";

interface ParentComponentProps {
  onNodeClickTs: (node: PluginInstance) => void;
  onNodeClick: (node: PluginInstance) => void;
  isSidePanelExpanded: boolean;
  isBottomPanelExpanded: boolean;
  onExpand: (panel: string) => void;
  instances?: PluginInstance[];
}

export type TSID = {
  [key: string]: number[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const {
    onNodeClick,
    onNodeClickTs,
    isSidePanelExpanded,
    isBottomPanelExpanded,
    onExpand,
    instances,
  } = props;

  const [data, setData] = React.useState<TreeNodeDatum[]>([]);
  const [tsIds, setTsIds] = React.useState<TSID>();
  const dispatch = useDispatch();

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

  return data && data.length > 0 ? (
    <FeedTree
      onNodeClickTs={onNodeClickTs}
      data={data}
      tsIds={tsIds}
      onNodeClick={onNodeClick}
      separation={
        instances && instances.length > 15
          ? {
              siblings: 0.5,
              nonSiblings: 0.5,
            }
          : {
              siblings: 1.0,
              nonSiblings: 2.0,
            }
      }
      changeOrientation={changeOrientation}
      isSidePanelExpanded={isSidePanelExpanded}
      isBottomPanelExpanded={isBottomPanelExpanded}
      onExpand={onExpand}
    />
  ) : (
    <SpinContainer
      background="rgb(40, 45, 51)"
      title="Constructing the Feed Tree"
    />
  );
};

export default React.memo(
  ParentComponent,
  (prevProps: ParentComponentProps, nextProps: ParentComponentProps) => {
    if (
      prevProps.isBottomPanelExpanded !== nextProps.isBottomPanelExpanded ||
      prevProps.isSidePanelExpanded !== nextProps.isSidePanelExpanded ||
      prevProps.instances !== nextProps.instances
    ) {
      return false;
    }
    return true;
  }
);
