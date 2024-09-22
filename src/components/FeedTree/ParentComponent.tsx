import React from "react";
import { setFeedTreeProp } from "../../store/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type TreeNodeDatum from "./data";
import { getFeedTree, getTsNodes } from "./data";
import "./FeedTree.css";

interface ParentComponentProps {
  onNodeClick: (node: any) => void;
}

export type TSID = {
  [key: string]: number[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const { onNodeClick } = props;
  const pluginInstances = useAppSelector(
    (state) => state.instance.pluginInstances,
  );
  const { data: instances, error, loading } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[]>([]);
  const [tsIds, setTsIds] = React.useState<TSID>();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const data = getFeedTree(instances);

      //Get Topological joins as well
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
