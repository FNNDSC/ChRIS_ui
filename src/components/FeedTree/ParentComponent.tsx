import React from "react";
import { useDispatch } from "react-redux";
import { setFeedTreeProp } from "../../store/feed/actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import FeedTree from "./FeedTree";
import { getFeedTree, TreeNodeDatum, getTsNodes } from "./data";
import { useTypedSelector } from "../../store/hooks";
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
    (state) => state.instance.pluginInstances
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
              siblings: 0.5,
              nonSiblings: 0.5,
            }
          : {
              siblings: 1.0,
              nonSiblings: 2.0,
            }
      }
      changeOrientation={changeOrientation}
    />
  ) : loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div className="feed-tree">
      <div>There was an error</div>
    </div>
  ) : null;
};

export default ParentComponent;