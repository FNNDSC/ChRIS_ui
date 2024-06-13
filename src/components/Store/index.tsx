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
  Modal,
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
} from "@patternfly/react-core";
import "../SinglePlugin/singlePlugin.css";
import { format } from "date-fns";
import { setSidebarActive } from "../../store/ui/actions";
import { useDispatch } from "react-redux";
import { InfoIcon } from "../Common";
import { isEmpty } from "lodash";

const { Paragraph } = Typography;

const Store = () => {
  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const [version, setVersion] = useState<{
    [key: string]: any;
  }>({});
  const [installingPlugin, setInstallingPlugin] = useState<
    | {
        data: any;
      }
    | undefined
  >(undefined);
  const [enterAdminCred, setEnterAdminCred] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");

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
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["storePlugins"],
    queryFn: fetchPlugins,
  });

  const handleInstall = async (selectedPlugin: Plugin) => {
    if (!url) {
      throw new Error("Please provide a link to your chris-admin url");
    }
    const credentials = btoa(`${username.trim()}:${password.trim()}`); // Base64 encoding for Basic Auth
    const pluginData = {
      compute_names: "host",
      name: selectedPlugin.data.name,
      version: selectedPlugin.data.version,
      plugin_store_url: selectedPlugin.url,
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
      console.log("Error", error);
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const handleInstallMutation = useMutation({
    mutationFn: async (selectedPlugin: Plugin) =>
      await handleInstall(selectedPlugin),
    onSettled: (error) => {
      if (!isEmpty(error)) {
        setInstallingPlugin(undefined);
        setEnterAdminCred(false);
      }
    },
  });

  const handleSave = () => {
    if (installingPlugin) {
      let selectedPlugin: Plugin | undefined = undefined;
      if (!isEmpty(version)) {
        const findPlugin = installingPlugin.data.plugins.find(
          (pluginMeta: any) => {
            return (
              pluginMeta.data.version === version[installingPlugin.data.id]
            );
          },
        );
        if (findPlugin) {
          selectedPlugin = findPlugin;
        }
      } else {
        selectedPlugin = installingPlugin.data.plugins[0];
      }

      if (selectedPlugin) {
        handleInstallMutation.mutate(selectedPlugin);
      }
    }
  };

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
      <Modal
        variant="small"
        isOpen={enterAdminCred}
        onClose={() => setEnterAdminCred(!enterAdminCred)}
        aria-label="Enter admin credentials"
      >
        <Form isWidthLimited>
          <FormGroup label="Enter a username" isRequired>
            <TextInput
              id="username"
              isRequired
              type="text"
              value={username}
              onChange={(_event, value: string) => {
                setUsername(value);
              }}
            />
          </FormGroup>
          <FormGroup label="Enter a password" isRequired>
            <TextInput
              id="password"
              isRequired
              type="password"
              value={password}
              onChange={(_event, value: string) => {
                setPassword(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </FormGroup>

          <FormGroup
            label="Enter the url to your chris-admin dashboard"
            isRequired
          >
            <TextInput
              id="url"
              isRequired
              type="url"
              value={url}
              onChange={(_event, value: string) => {
                setUrl(value);
              }}
              placeholder="eg: http://localhost:8000/chris-admin/api/v1/"
            />
          </FormGroup>
          <ActionGroup>
            <Button
              onClick={() => {
                handleSave();
              }}
              isDisabled={!(username && password && url)}
              variant="primary"
              icon={handleInstallMutation.isPending && <Spin />}
            >
              Submit
            </Button>
            <Button
              onClick={() => setEnterAdminCred(!enterAdminCred)}
              variant="link"
            >
              Cancel
            </Button>
          </ActionGroup>
          {handleInstallMutation.isError && (
            <Alert
              type="error"
              closable
              description={handleInstallMutation.error.message}
            />
          )}
        </Form>
      </Modal>

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
                        handlePluginVersion={(selectedVersion: any) => {
                          setVersion({
                            [plugin.data.id]: selectedVersion,
                          });
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
                      onClick={() => {
                        setEnterAdminCred(!enterAdminCred);
                        setInstallingPlugin(plugin);
                      }}
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

const VersionSelect = ({
  plugins,
  currentVersion,
  handlePluginVersion,
}: {
  plugins: Plugin[];
  currentVersion: string;
  handlePluginVersion: (value: string | number | undefined) => void;
}) => {
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
