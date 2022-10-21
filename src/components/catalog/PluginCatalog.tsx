import React, { useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import DisplayPage from "./DisplayPage";
import { Title, EmptyState, EmptyStateIcon, Spinner } from '@patternfly/react-core';

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
  const [loading, setLoading] = React.useState(false)

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
      setLoading(true)
      const offset = perPage * (page - 1);
      const client = ChrisAPIClient.getClient();
      const params = {
        limit: perPage,
        offset: offset,
        name: search,
      };
      const pluginsList = await client.getPlugins(params);
      const plugins = pluginsList.getItems();
      if (plugins) {
        setPlugins(plugins);
        setPageState((pageState) => {
          return {
            ...pageState,
            itemCount: pluginsList.totalCount,
          };
        });
      }
      setLoading(false)

    }

    fetchPlugins(perPage, page, search);
  }, [perPage, page, search]);

  const handleSearch = (search: string) => {
    setPageState({
      ...pageState,
      search,
    });
  };

  if (loading) {
    return <>
      <EmptyState>
        <EmptyStateIcon variant="container" component={Spinner} />
        <Title headingLevel='h4'>
          Pipelines loading...please wait
        </Title>
      </EmptyState>
    </>
  }

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
