import WrapperConnect from "../Wrapper";
import { useEffect, useState, Ref } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Client, { Plugin } from "@fnndsc/chrisapi";
import { SpinContainer } from "../Common";
import { Alert, Spin, Typography, notification } from "antd";
import {
  Card,
  Grid,
  GridItem,
  Button,
  CardBody,
  Split,
  SplitItem,
  PageSection,
  Badge,
  Select,
  SelectOption,
  MenuToggleElement,
  MenuToggle,
} from "@patternfly/react-core";
import "../SinglePlugin/singlePlugin.css";
import { format } from "date-fns";
import { setSidebarActive } from "../../store/ui/actions";
import { useDispatch } from "react-redux";
import { InfoIcon } from "../Common";

const { Paragraph } = Typography;

const Store = () => {
  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const [version, setVersion] = useState({});
  const [installingPluginId, setInstallingPluginId] = useState(null);

  useEffect(() => {
    document.title = "Store Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "store",
      }),
    );
  }, [dispatch]);

  const fetchPlugins = async () => {
    const url = import.meta.env.VITE_CHRIS_STORE_URL;
    if (!url) {
      throw new Error("No url found for a store");
    }

    const client = new Client(url);

    try {
      const pluginMetaList = await client.getPluginMetas({ limit: 1000 });

      const pluginMetas = pluginMetaList.getItems() || [];

      if (pluginMetas.length > 0) {
        const newPluginPayload = await Promise.all(
          pluginMetas.map(async (plugin) => {
            const plugins = await plugin.getPlugins({ limit: 1000 });
            const pluginItems = plugins.getItems();
            let version = "";
            if (pluginItems && pluginItems.length > 0) {
              version = pluginItems[0].data.version;
            }
            return {
              data: {
                ...plugin.data,
                version,
                plugins: pluginItems,
              },
            };
          }),
        );
        return {
          pluginMetaList: newPluginPayload,
          client: client,
        };
      }

      return {
        pluginMetaList: [],
        client: client,
      };
    } catch (error) {
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["storePlugins"],
    queryFn: fetchPlugins,
  });

  const handleInstall = async (plugins: Plugin[], plugin: any) => {
    if (!plugins || plugins.length === 0) {
      throw new Error("No plugins available to install.");
    }
    const latestPlugin = plugins[0];
    const url = "http://localhost:8000/chris-admin/api/v1/";
    const credentials = btoa("chris:chris1234"); // Base64 encoding for Basic Auth

    const pluginData = {
      compute_names: "host",
      name: latestPlugin.data.name,
      version: version[plugin.data.id] || latestPlugin.data.version,
      plugin_store_url: latestPlugin.url,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pluginData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleInstallMutation = useMutation({
    mutationFn: async ({
      plugins,
      plugin,
    }: { plugins: Plugin[]; plugin: any }) =>
      await handleInstall(plugins, plugin),
    onMutate: ({ plugin }) => {
      setInstallingPluginId(plugin.data.id);
    },
    onSettled: () => {
      setInstallingPluginId(null);
    },
  });

  useEffect(() => {
    if (handleInstallMutation.isSuccess) {
      api.success({
        message: "Plugin Successfully installed...",
      });
    }

    if (handleInstallMutation.isError) {
      api.error({
        message: "Unable to install this plugin...",
      });
    }
  }, [handleInstallMutation.isSuccess, handleInstallMutation.isError, api]);

  return (
    <WrapperConnect>
      {contextHolder}
      <PageSection
        style={{
          marginBottom: "0",
        }}
      >
        <InfoIcon
          title="Plugin Store"
          p1={
            <Paragraph>
              <p>
                This is a global store from where you can install your plugins.
              </p>
            </Paragraph>
          }
        />
      </PageSection>
      <PageSection>
        {isLoading && <SpinContainer title="Fetching Plugins" />}
        {isError && <Alert type="error" description={error.message} />}
        {data && (
          <Grid hasGutter={true}>
            {data.pluginMetaList.map((plugin) => (
              <GridItem key={plugin.data.id} span={6}>
                <Card className="plugin-item-card">
                  <CardBody className="plugin-item-card-body">
                    <Split>
                      <SplitItem isFilled>
                        <p
                          style={{
                            fontSize: "0.9em",
                            fontWeight: "bold",
                          }}
                        >
                          {plugin.data.name}
                        </p>
                      </SplitItem>
                      <SplitItem>
                        <Badge isRead>{plugin.data.category}</Badge>
                      </SplitItem>
                    </Split>
                    <div className="plugin-item-name">{plugin.data.title}</div>

                    <div className="plugin-item-author">
                      {plugin.data.authors}
                    </div>
                    <p
                      style={{
                        fontSize: "0.90rem",
                      }}
                    >
                      {format(
                        new Date(plugin.data.modification_date),
                        "do MMMM, yyyy",
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "0.90rem",
                        marginTop: "1em",
                      }}
                    >
                      Version:{" "}
                      <VersionSelect
                        handlePluginVersion={(selectedVersion) => {
                          setVersion((prevVersion) => ({
                            ...prevVersion,
                            [plugin.data.id]: selectedVersion,
                          }));
                        }}
                        currentVersion={
                          version[plugin.data.id] || plugin.data.version
                        }
                        plugins={plugin.data.plugins}
                      />
                    </p>

                    <Button
                      style={{
                        marginTop: "1em",
                      }}
                      onClick={() =>
                        handleInstallMutation.mutate({
                          plugins: plugin.data.plugins,
                          plugin,
                        })
                      }
                      icon={installingPluginId === plugin.data.id && <Spin />}
                    >
                      Install
                    </Button>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        )}
      </PageSection>
    </WrapperConnect>
  );
};

export default Store;

const VersionSelect = ({ plugins, currentVersion, handlePluginVersion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    handlePluginVersion(value);
    setIsOpen(false);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{
        width: "200px",
      }}
    >
      {currentVersion}
    </MenuToggle>
  );

  return (
    <Select
      id="option-variations-select"
      isOpen={isOpen}
      selected={currentVersion}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      {plugins.map((plugin) => (
        <SelectOption key={plugin.data.version} value={plugin.data.version}>
          {plugin.data.version}
        </SelectOption>
      ))}
    </Select>
  );
};
