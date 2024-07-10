import Client, { Plugin } from "@fnndsc/chrisapi";
import {
  ActionGroup,
  Badge,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Modal,
  PageSection,
  Select,
  SelectOption,
  Split,
  SplitItem,
  Text,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextVariants,
} from "@patternfly/react-core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Spin, Typography, notification } from "antd";
import { format } from "date-fns";
import { isEmpty } from "lodash";
import { Ref, useEffect, useState } from "react";
import { Cookies, useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { setSidebarActive } from "../../store/ui/actions";
import { InfoIcon, SpinContainer } from "../Common";
import { CheckCircleIcon, SearchIcon } from "../Icons";
import "../SinglePlugin/singlePlugin.css";
import WrapperConnect from "../Wrapper";

const { Paragraph } = Typography;

const Store = () => {
  const isStaff = useTypedSelector((state) => state.user.isStaff);
  const queryClient = useQueryClient();
  const [_cookie, setCookie] = useCookies();
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Store Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "store",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const cookies = new Cookies();

    if (cookies.get("admin_username")) {
      setUsername(cookies.get("admin_username"));
    }

    if (cookies.get("admin_password")) {
      setPassword(cookies.get("admin_password"));
    }
  }, []);

  const fetchPlugins = async (search: string) => {
    const url = import.meta.env.VITE_CHRIS_STORE_URL;
    if (!url) {
      throw new Error("No url found for a store");
    }
    const client = new Client(url);

    try {
      const pluginMetaList = await client.getPluginMetas({
        limit: 1000,
        name: search.trim().toLowerCase(),
      });

      const pluginMetas = pluginMetaList.getItems() || [];

      if (pluginMetas.length > 0) {
        const newPluginPayload = await Promise.all(
          pluginMetas.map(async (plugin) => {
            const plugins = await plugin.getPlugins({
              limit: 1000,
            });
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

  const fetchExistingPlugins = async () => {
    const existingClient = ChrisAPIClient.getClient();
    const exisitingPluginMetaList = await existingClient.getPluginMetas({
      limit: 1000,
    });
    const plugins = exisitingPluginMetaList.getItems();

    if (plugins) {
      const newPluginPayload = Promise.all(
        plugins.map(async (plugin) => {
          const plugins = await plugin.getPlugins({ limit: 1000 });
          const pluginItems = plugins.getItems();
          return {
            data: {
              ...plugin.data,
              items: pluginItems.map((plugin: any) => plugin.data.version),
            },
          };
        }),
      );

      return newPluginPayload;
    }
  };

  const handleInstall = async (selectedPlugin: Plugin) => {
    const adminURL = import.meta.env.VITE_CHRIS_UI_URL;
    const url = adminURL.replace("/api/v1/", "/chris-admin/api/v1/");
    if (!url) {
      throw new Error("Please provide a link to your chris-admin url");
    }

    if (!username) {
      throw new Error("Please provide a username");
    }
    if (!password) {
      throw new Error("Please enter a password");
    }

    const client = ChrisAPIClient.getClient();
    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`); // Base64 encoding for Basic Auth
    const nonAdminCredentials = `Token ${client.auth.token}`;
    const authorization = !isStaff
      ? `Basic ${adminCredentials}`
      : nonAdminCredentials;

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
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pluginData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const oneDayToSeconds = 24 * 60 * 60;
      setCookie("admin_username", username, {
        path: "/",
        maxAge: oneDayToSeconds,
      });

      setCookie("admin_password", password, {
        path: "/",
        maxAge: oneDayToSeconds,
      });

      const data = await response.json();

      return data;
    } catch (error) {
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["storePlugins", search],
    queryFn: () => {
      return fetchPlugins(search);
    },
  });

  const { data: existingPlugins } = useQuery({
    queryKey: ["existingStorePlugins"],
    queryFn: () => {
      return fetchExistingPlugins();
    },
  });

  const handleSave = (passedPlugin?: any) => {
    const plugin = passedPlugin || installingPlugin;
    if (plugin) {
      let selectedPlugin: Plugin | undefined = undefined;
      if (!isEmpty(version)) {
        const findPlugin = plugin.data.plugins.find((pluginMeta: any) => {
          return pluginMeta.data.version === version[plugin.data.id];
        });
        if (findPlugin) {
          selectedPlugin = findPlugin;
        }
      } else {
        selectedPlugin = plugin.data.plugins[0];
      }

      if (selectedPlugin) {
        handleInstallMutation.mutate(selectedPlugin);
      }
    }
  };

  useEffect(() => {
    if (handleInstallMutation.isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["existingStorePlugins"],
      });
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

          <ActionGroup>
            <Button
              onClick={() => {
                handleSave();
              }}
              isDisabled={!(username && password)}
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
        <Text component={TextVariants.h6}>
          You are currently viewing plugins fetched from{" "}
          {import.meta.env.VITE_CHRIS_STORE_URL}
        </Text>
      </PageSection>
      <PageSection>
        <Grid>
          <GridItem span={4}>
            <TextInputGroup>
              <TextInputGroupMain
                value={search}
                onChange={(_e, value: string) => setSearch(value)}
                icon={<SearchIcon />}
                placeholder="Search for plugins by name"
              />
            </TextInputGroup>
          </GridItem>
        </Grid>

        {isLoading && <SpinContainer title="Fetching Plugins" />}
        {isError && <Alert type="error" description={error.message} />}

        {data && (
          <Grid hasGutter={true}>
            {data.pluginMetaList.map((plugin) => {
              const currentVersion =
                version[plugin.data.id] || plugin.data.version;
              const isInstalled = existingPlugins?.some(
                (existingPlugin) =>
                  existingPlugin.data.name === plugin.data.name &&
                  existingPlugin.data.items.includes(currentVersion),
              );
              return (
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
                      <div className="plugin-item-name">
                        {plugin.data.title}
                      </div>

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

                      {isInstalled ? (
                        <div
                          style={{
                            marginTop: "1em",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Icon
                            style={{
                              marginRight: "0.5em",
                            }}
                            status="success"
                          >
                            {" "}
                            <CheckCircleIcon />
                          </Icon>
                          <div>Installed</div>
                        </div>
                      ) : (
                        <Button
                          icon={
                            isStaff &&
                            installingPlugin?.data.id === plugin.data.id &&
                            handleInstallMutation.isPending && <Spin />
                          }
                          style={{
                            marginTop: "1em",
                          }}
                          onClick={() => {
                            setInstallingPlugin(plugin);
                            if (isStaff) {
                              handleSave(plugin);
                            } else {
                              setEnterAdminCred(!enterAdminCred);
                            }
                          }}
                        >
                          Install
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>
              );
            })}
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
      style={{ width: "200px" }}
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
