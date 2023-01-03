import React from "react";
import { Button } from "@patternfly/react-core";
import { Popover } from "antd";
import { FaCodeBranch } from "react-icons/fa";
import { useTypedSelector } from "../../../store/hooks";
import { useDispatch } from "react-redux";
import { switchTreeMode } from "../../../store/tsplugins/actions";
import GraphNode from "./ParentContainer";
import { Plugin } from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";

const GraphNodeContainer = () => {
  const dispatch = useDispatch();
  const [isGraphNodeVisible, setIsGraphNodeVisible] = React.useState(false);
  const [selectedTsPlugin, setTsPlugin] = React.useState<Plugin | undefined>();
  const { treeMode } = useTypedSelector((state) => state.tsPlugins);
  const handleVisibleChange = (visible: boolean) => {
    if (treeMode === true) {
      dispatch(switchTreeMode(false));
    } else {
      dispatch(switchTreeMode(true));
    }
    setIsGraphNodeVisible(visible);
  };

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
          visible={isGraphNodeVisible}
          onVisibleChange={handleVisibleChange}
        />
      }
      placement="bottom"
      open={isGraphNodeVisible}
      onOpenChange={handleVisibleChange}
      trigger="click"
    >
      <Button type="button" icon={<FaCodeBranch />}>
        Add a Graph Node
      </Button>
    </Popover>
  );
};
export default GraphNodeContainer;
