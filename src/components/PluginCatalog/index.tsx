import React, { useEffect } from "react";
import {
  Pagination,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Title,
  Divider,
} from "@patternfly/react-core";
import ChrisAPIClient from "../../api/chrisapiclient";
import { DataTableToolbar } from "..";

const PluginCatalog = () => {
  const [plugins, setPlugins] = React.useState<any[]>();
  const [pageState, setPageState] = React.useState({
    page: 1,
    perPage: 18,
    search: "",
    itemCount: 0,
  });

  const { page, perPage, search, itemCount } = pageState;
  const [selectedPlugin, setSelectedPlugin] = React.useState<any>();
  const [isExpanded, setIsExpanded] = React.useState(false);
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
    }

    fetchPlugins(perPage, page, search);
  }, [perPage, page, search]);

  const drawerContent = (
    <Grid hasGutter={true}>
      {plugins &&
        plugins.length > 0 &&
        plugins.map((plugin) => {
          return (
            <GridItem lg={2} md={4} sm={2} key={plugin.data.id}>
              <Card
                isSelectable
                isSelected={
                  selectedPlugin && selectedPlugin.data.id === plugin.data.id
                }
                onClick={() => {
                  setSelectedPlugin(plugin);
                  setIsExpanded(true);
                }}
                onKeyDown={(event: any) => {
                  if ([13, 32].includes(event.keyCode)) {
                    setSelectedPlugin(plugin);
                    setIsExpanded(true);
                  }
                }}
                className="pluginList"
                key={plugin.data.id}
              >
                <CardTitle>
                  <p className="pluginList__name">{plugin.data.name}</p>
                  <p className="pluginList__authors">{plugin.data.authors}</p>
                </CardTitle>

                <CardBody>
                  <p className="pluginList__description">
                    {plugin.data.description}
                  </p>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
    </Grid>
  );

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton
            onClick={() => {
              setIsExpanded(false);
            }}
          />
        </DrawerActions>
        {selectedPlugin && (
          <>
            <Title headingLevel="h2">{selectedPlugin.data.name}</Title>
            <p className="pluginList__authors">{selectedPlugin.data.authors}</p>
            <Divider
              style={{
                paddingTop: "2em",
              }}
            />
            <p>{selectedPlugin.data.description}</p>
          </>
        )}
      </DrawerHead>
    </DrawerPanelContent>
  );

  return (
    <>
      <DataTableToolbar label="Search" onSearch={handleFilterChange} />
      <Pagination
        itemCount={itemCount}
        perPage={perPage}
        page={page}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
      <Drawer isExpanded={isExpanded}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>{drawerContent}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PluginCatalog;
