import React from "react";
import Client from "../../../api/chrisapiclient";
import { Plugin } from "@fnndsc/chrisapi";
import { List, Button } from "antd";

type JoinProps = {
  handlePluginSelect: (item: Plugin) => void;
  selectedTsPlugin?: Plugin;
};

const Join = ({ handlePluginSelect, selectedTsPlugin }: JoinProps) => {
  const [tsPluginList, setTsPluginList] = React.useState<Plugin[]>([]);

  React.useEffect(() => {
    async function fetchTsPlugins() {
      const client = Client.getClient();
      const pluginList = await client.getPlugins({
        limit: 50,
      });
      const pluginListItems = pluginList.getItems();
      if (pluginListItems) {
        const tsPlugins: Plugin[] = pluginListItems.filter((item) => {
          if (item.data.type === "ts") return item;
        });
        setTsPluginList(tsPlugins);
      }
    }

    fetchTsPlugins();
  }, []);

  return (
    <div className="list-container">
      <List
        size="small"
        itemLayout="horizontal"
        dataSource={tsPluginList}
        renderItem={(item) => (
          <>
            <List.Item>
              <List.Item.Meta
                title={item.data.name}
                description={item.data.description}
              />
              <Button
                disabled={selectedTsPlugin !== undefined ? true : false}
                onClick={() => {
                  handlePluginSelect(item);
                }}
                type="primary"
              >
                Select
              </Button>
            </List.Item>
          </>
        )}
      />
    </div>
  );
};

export default Join;
