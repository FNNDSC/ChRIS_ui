import React, { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { PluginMeta } from "@fnndsc/chrisapi";
import DisplayPage from "./DisplayPage";


const PluginCatalog = () => {
  const [plugins, setPlugins] = React.useState<any>();
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 10,
    search: "",
    itemCount: 0,
  });
  const [loading, setLoading] = React.useState(false);

  const { page, perPage, search } = pageState;
  const [selectedPlugin, setSelectedPlugin] = React.useState<any>();

  const onSetPage = (_event: any, page: number) => {
    setPageState({
      ...pageState,
      page,
    });
  };
  const onPerPageSelect = (_event: any, perPage: number) => {
    setPageState({
      ...pageState,
      perPage,
    });
  };

  const handleFilterChange = (value: string) => {
    setPageState({
      ...pageState,
      search: value,
    });
  };
  useEffect(() => {
    async function fetchPlugins(perPage: number, page: number, search: string) {
      setLoading(true);
      const offset = perPage * (page - 1);
      const params = {
        limit: perPage,
        offset: offset,
        name: search,
      };
      const client = ChrisAPIClient.getClient();
      const pluginList = await client.getPluginMetas(params);
      const plugins: PluginMeta[] = pluginList.getItems() as PluginMeta[];
      if (plugins) {
        const newPluginPayload = Promise.all(
          plugins.map(async (plugin) => {
            const plugins = await plugin.getPlugins({ limit: 1000 });
            const pluginItems = plugins.getItems();
            let version = "";
            if (pluginItems) {
              version = pluginItems[0].data.version;
            }
            return {
              data: {
                ...plugin.data,
                version,
              },
            };
          })
        );
        setPlugins(await newPluginPayload);
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: pluginList.totalCount,
          };
        });
        setLoading(false);
      }
    }

    fetchPlugins(perPage, page, search);
  }, [perPage, page, search]);

  const handleSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    });
  };

  return (
    <>
      <DisplayPage
        loading={loading}
        pageState={pageState}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        resources={plugins}
        handleFilterChange={handleFilterChange}
        selectedResource={selectedPlugin}
        setSelectedResource={(plugin: any) => {
          setSelectedPlugin(plugin);
        }}
        title="Plugins"
        handlePluginSearch={handleSearch}
        search={pageState.search}
      />
    </>
  );
};

export default PluginCatalog;
