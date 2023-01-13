import React, { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import DisplayPage from "./DisplayPage";
import { fetchResource } from "../../api/common";
import { PluginMetaList } from "@fnndsc/chrisapi";

const PluginCatalog = () => {
  const [plugins, setPlugins] = React.useState<any[]>();
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 10,
    search: "",
    itemCount: 0,
  });

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
      const offset = perPage * (page - 1);
      const params = {
        limit: perPage,
        offset: offset,
        name: search,
      };
      const client = ChrisAPIClient.getClient();
      const fn = client.getPluginMetas;
      const boundFn = fn.bind(client);
      try {
        const { resource: plugins, totalCount } =
          await fetchResource<PluginMetaList>(params, boundFn);

        if (plugins) {
          setPlugins(plugins);
          setPageState((pageState) => {
            return {
              ...pageState,
              itemCount: totalCount,
            };
          });
        }
      } catch (error) {}
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
