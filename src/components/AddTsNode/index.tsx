import React from "react";
import { Button } from "@patternfly/react-core";
import { useDispatch } from "react-redux";
import { Popover } from "antd";
import FaCodeBranch from "@patternfly/react-icons/dist/esm/icons/code-branch-icon";
import { useTypedSelector } from "../../store/hooks";
import { switchTreeMode } from "../../store/tsplugins/actions";
import GraphNode from "./ParentContainer";
import type { Plugin } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getNodeOperations } from "../../store/plugin/actions";
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
      <Button type="button" icon={<FaCodeBranch />}>
        Add a Graph Node{" "}
        <span style={{ padding: "2px", fontSize: "11px" }}>( G )</span>
      </Button>
    </Popover>
  );
};
export default GraphNodeContainer;
