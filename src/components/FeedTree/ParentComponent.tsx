import React from "react";
import { Alert } from "antd";
import { useDispatch } from "react-redux";
import { PluginInstance } from "@fnndsc/chrisapi";
import { setFeedTreeProp } from "../../store/feed/actions";
import FeedTree from "./FeedTree";
import TreeNodeDatum, { getFeedTree, getTsNodes } from "./data";
import { useTypedSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import "./FeedTree.css";

interface ParentComponentProps {
  onNodeClickTs: (node: PluginInstance) => void;
  onNodeClick: (node: any) => void;
}

export type TSID = {
  [key: string]: number[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const { onNodeClick, onNodeClickTs } = props;
  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  );
  const { data: instances, error, loading } = pluginInstances;
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
              siblings: 1.0,
              nonSiblings: 2.0,
            }
          : {
              siblings: 0.75,
              nonSiblings: 1.0,
            }
      }
      changeOrientation={changeOrientation}
    />
  ) : loading ? (
    <SpinContainer title="Loading the tree" />
  ) : error ? (
    <Alert type="error" description={error} />
  ) : null;
};

export default ParentComponent;
