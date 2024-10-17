import { useEffect, useState } from "react";
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
  const [data, setData] = useState<TreeNodeDatum[]>([]);
  const [tsIds, setTsIds] = useState<TSID>();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (instances && instances.length > 0) {
      setCreating(true);
      try {
        const data = getFeedTree(instances);
        setData(data);
        getTsNodes(instances).then((nodes) => {
          setTsIds(nodes);
        });
      } catch (e) {
        setCreating(false);
      } finally {
        setCreating(false);
      }
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
  ) : loading || creating ? (
    <SpinContainer title="Loading the tree" />
  ) : error ? (
    <Alert type="error" description={error} />
  ) : null;
};

export default ParentComponent;
