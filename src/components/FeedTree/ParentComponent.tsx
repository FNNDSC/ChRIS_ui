import React from "react";
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { SpinContainer } from "../Common";
import FeedTree from "./FeedTree";
import type { TreeNodeDatum } from "./data";
import { getFeedTree, getTsNodes } from "./data";
import "./FeedTree.css";

interface ParentComponentProps {
  onNodeClick: (node: any) => void;
  changeLayout: () => void;
  currentLayout: boolean;
}

export type TSID = {
  [key: string]: number[];
};

const ParentComponent = (props: ParentComponentProps) => {
  const { onNodeClick, changeLayout, currentLayout } = props;
  const pluginInstances = useAppSelector(
    (state) => state.instance.pluginInstances,
  );
  const { data: instances, error, loading } = pluginInstances;
  const [data, setData] = React.useState<TreeNodeDatum[]>([]);
  const [tsIds, setTsIds] = React.useState<TSID>();

  React.useEffect(() => {
    if (instances && instances.length > 0) {
      const data = getFeedTree(instances);

      getTsNodes(instances).then((nodes) => {
        setTsIds(nodes);
      });
      setData(data);
    }
  }, [instances]);

  return data && data.length > 0 ? (
    <FeedTree
      data={data}
      tsIds={tsIds}
      onNodeClick={onNodeClick}
      changeLayout={changeLayout}
      currentLayout={currentLayout}
    />
  ) : loading ? (
    <SpinContainer title="Loading the tree" />
  ) : error ? (
    <Alert type="error" description={error} />
  ) : null;
};

export default ParentComponent;
