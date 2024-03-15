import type { Plugin } from "@fnndsc/chrisapi";
import { Button } from "@patternfly/react-core";
import { Popover } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/actions";
import { switchTreeMode } from "../../store/tsplugins/actions";
import { CodeBranchIcon } from "../Icons";
import GraphNode from "./ParentContainer";
import "./graph-node.css";

const GraphNodeContainer = () => {
  const dispatch = useDispatch();
  const { childGraph } = useTypedSelector(
    (state) => state.plugin.nodeOperations,
  );
  const [selectedTsPlugin, setTsPlugin] = React.useState<Plugin | undefined>();
  const { treeMode } = useTypedSelector((state) => state.tsPlugins);
  const handleVisibleChange = React.useCallback(() => {
    if (treeMode === true) {
      dispatch(switchTreeMode(false));
    } else {
      dispatch(switchTreeMode(true));
    }
    dispatch(getNodeOperations("childGraph"));
  }, [dispatch, treeMode]);

  React.useEffect(() => {
    const fetchTsPlugin = async () => {
      const client = ChrisAPIClient.getClient();
      const pluginList = await client.getPlugins({
        limit: 1000,
      });
      const pluginListItems = pluginList.getItems();
      if (pluginListItems) {
        const tsPlugins: Plugin[] = pluginListItems.filter((item) => {
          if (item.data.type === "ts") return item;
        });
        setTsPlugin(() => {
          return tsPlugins[0];
        });
      }
    };
    fetchTsPlugin();
  }, []);

  return (
    <Popover
      content={
        <GraphNode
          selectedTsPlugin={selectedTsPlugin}
          visible={childGraph}
          onVisibleChange={handleVisibleChange}
        />
      }
      placement="bottom"
      open={childGraph}
      onOpenChange={handleVisibleChange}
      trigger="click"
    >
      <Button type="button" icon={<CodeBranchIcon />}>
        Add a Graph Node{" "}
        <span style={{ padding: "2px", fontSize: "11px" }}>( G )</span>
      </Button>
    </Popover>
  );
};
export default GraphNodeContainer;
