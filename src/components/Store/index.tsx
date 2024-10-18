import Client, {
  type ComputeResource,
  type ComputeResourceList,
  type Plugin,
} from "@fnndsc/chrisapi";
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
  HelperText,
  HelperTextItem,
  Icon,
  MenuToggle,
  type MenuToggleElement,
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
import { format } from "date-fns";
import { type Ref, useEffect, useState, useCallback, useMemo } from "react";
import { Cookies, useCookies } from "react-cookie";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { Alert, Spin, notification } from "../Antd";
import { SpinContainer } from "../Common";
import { CheckCircleIcon, SearchIcon } from "../Icons";
import "../SinglePlugin/singlePlugin.css";
import { InfoSection } from "../Common";
import {
  fetchPluginForMeta,
  fetchPluginMetas,
  handleInstallPlugin,
} from "../PipelinesCopy/utils";
import WrapperConnect from "../Wrapper";

const Store: React.FC = () => {
  const isStaff = useAppSelector((state) => state.user.isStaff);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const queryClient = useQueryClient();
  const [_cookie, setCookie] = useCookies();
  const [api, contextHolder] = notification.useNotification();
  const [version, setVersion] = useState<Record<string, any>>({});
  const [installingPlugin, setInstallingPlugin] = useState<
    { data: any } | undefined
  >(undefined);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tempURLValue, setTempURLValue] = useState("");
  const [configureURL, setConfigureURL] = useState("");
  const [computeResourceOptions, setComputeResourceOptions] = useState<
    string[]
  >([]);
  const [dropdown, setDropdown] = useState(false);

  const defaultStoreURL = import.meta.env.VITE_CHRIS_STORE_URL;
  const localCubeURL = import.meta.env.VITE_CHRIS_UI_URL;
  const cookies = new Cookies();
  const cookie_username = cookies.get("admin_username");
  const cookie_password = cookies.get("admin_password");
  const configure_url = cookies.get("configure_url");
  const compute_resource = cookies.get("compute_resource");

  // Initialize username and password with default values
  const [username, setUsername] = useState(() => {
    if (cookie_username) return cookie_username;
    if (isStaff) return "chris";
    return "";
  });

  const [password, setPassword] = useState(() => {
    if (cookie_password) return cookie_password;
    if (isStaff) return "chris1234";
    return "";
  });

  // Initialize computeResource from cookie or default to 'host'
  const [computeResource, setComputeResource] = useState(() => {
    return compute_resource || "host";
  });

  // Fetch compute resources on load
  useEffect(() => {
    async function fetchComputeResources() {
      if (!isLoggedIn) {
        // User is not logged in, do not fetch compute resources
        setComputeResourceOptions([]);
        // Set computeResource from cookie if available
        if (compute_resource) {
          setComputeResource(compute_resource);
        }
        return;
      }

      const client = ChrisAPIClient.getClient();
      try {
        const response: ComputeResourceList =
          await client.getComputeResources();
        const items = response.getItems() as ComputeResource[];
        const availableResources: string[] = items.map(
          (resource: any) => resource.data.name,
        );

        if (availableResources.length === 0) {
          // No compute resources available, set default to 'host'
          setComputeResourceOptions([]);
          setComputeResource("host");
        } else {
          setComputeResourceOptions(availableResources);
          // Set the default compute resource
          if (
            compute_resource &&
            availableResources.includes(compute_resource)
          ) {
            setComputeResource(compute_resource);
          } else {
            setComputeResource(availableResources[0]); // Set the first compute resource as default
          }
        }
      } catch (error: any) {
        // Failed to fetch compute resources, set default to 'host'
        setComputeResourceOptions([]);
        setComputeResource("host");
      }
    }

    fetchComputeResources();
  }, [compute_resource, isLoggedIn]);

  useEffect(() => {
    document.title = "Store Catalog";
    setTempURLValue(configure_url || defaultStoreURL);
    setConfigureURL(configure_url || defaultStoreURL);
  }, [isStaff, configure_url, defaultStoreURL, isLoggedIn]);

  const fetchPlugins = useCallback(
    async (search: string) => {
      const client = new Client(configureURL);
      try {
        const params = {
          limit: 20,
          offset: 0,
          name: search.trim().toLowerCase(),
        };
        const pluginMetas = await fetchPluginMetas(client, params);

        const newPluginPayload = await Promise.all(
          pluginMetas.map(async (plugin) => {
            const pluginItems = await fetchPluginForMeta(plugin);
            const version = pluginItems?.[0]?.data.version || "";
            return { data: { ...plugin.data, version, plugins: pluginItems } };
          }),
        );
        return { pluginMetaList: newPluginPayload, client };
      } catch (error) {
        // biome-ignore lint/complexity/noUselessCatch: <explanation>
        throw error;
      }
    },
    [configureURL],
  );

  const fetchExistingPlugins = useCallback(async () => {
    const existingClient = ChrisAPIClient.getClient();
    const plugins = await fetchPluginMetas(existingClient);

    if (plugins) {
      return Promise.all(
        plugins.map(async (plugin) => {
          const pluginItems = await fetchPluginForMeta(plugin);
          return {
            data: {
              ...plugin.data,
              items: pluginItems?.map((plugin: any) => plugin.data.version),
            },
          };
        }),
      );
    }
  }, []);

  const handleInstall = async (selectedPlugin: Plugin) => {
    const adminURL = localCubeURL.replace("/api/v1/", "/chris-admin/api/v1/");

    if (!adminURL)
      throw new Error("Please provide a link to your chris-admin url");
    const client = ChrisAPIClient.getClient();
    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
    const nonAdminCredentials = `Token ${client.auth.token}`;
    const authorization = !isStaff
      ? `Basic ${adminCredentials}`
      : nonAdminCredentials;

    try {
      const data = await handleInstallPlugin(
        authorization,
        selectedPlugin,
        computeResource,
      );
      return data;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const handleInstallMutation = useMutation({
    mutationFn: (selectedPlugin: Plugin) => handleInstall(selectedPlugin),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["existingStorePlugins"] });
      api.success({ message: "Plugin Successfully installed..." });
      setInstallingPlugin(undefined);
    },
    onError: (error: any) => {
      api.error({
        message: "Failed to Install the plugin",
        description: error.message,
      });
      setInstallingPlugin(undefined);
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["storePlugins", search, configureURL],
    queryFn: () => fetchPlugins(search),
    retry: false,
  });

  const { data: existingPlugins } = useQuery({
    queryKey: ["existingStorePlugins"],
    queryFn: fetchExistingPlugins,
  });

  const handleSave = (passedPlugin?: any) => {
    const plugin = passedPlugin || installingPlugin;
    const selectedPlugin = version[plugin?.data.id]
      ? plugin?.data.plugins.find(
          (p: any) => p.data.version === version[plugin.data.id],
        )
      : plugin?.data.plugins[0];
    if (selectedPlugin) handleInstallMutation.mutate(selectedPlugin);
  };

  const handleConfigSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Save to cookies
    setCookie("admin_username", username, { path: "/", maxAge: 86400 });
    setCookie("admin_password", password, { path: "/", maxAge: 86400 });
    setCookie("configure_url", tempURLValue, { path: "/", maxAge: 86400 });
    setCookie("compute_resource", computeResource, {
      path: "/",
      maxAge: 86400,
    });
    // Update the configureURL
    setConfigureURL(tempURLValue);
    // Close the modal
    setIsConfigModalOpen(false);

    // Notify the user of the successful config save
    api.success({
      message: "Configuration Saved",
      description: "Your configuration has been saved successfully.",
      duration: 1,
    });
    // If there is a plugin pending installation, proceed to install
    if (installingPlugin) {
      handleSave();
    }
  };

  const TitleComponent = useMemo(
    () => (
      <InfoSection
        title="Plugin Store"
        content="This is a global store from where you can install your plugins."
      />
    ),
    [],
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      {contextHolder}
      <Modal
        variant="small"
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        aria-label="Configure Store"
      >
        <Form isWidthLimited onSubmit={handleConfigSave}>
          <FormGroup label="Admin Username" isRequired>
            <TextInput
              id="username"
              isRequired
              type="text"
              value={username}
              onChange={(_event, value: string) => setUsername(value)}
            />
          </FormGroup>
          <FormGroup label="Admin Password" isRequired>
            <TextInput
              id="password"
              isRequired
              type="password"
              value={password}
              onChange={(_event, value: string) => setPassword(value)}
            />
          </FormGroup>
          <FormGroup label="Store URL" isRequired>
            <TextInput
              id="store_url"
              isRequired
              type="text"
              value={tempURLValue}
              onChange={(_event, value: string) => setTempURLValue(value)}
              placeholder="http://rc-live.tch.harvard.edu:32222/api/v1/"
            />
          </FormGroup>
          <HelperText>
            <HelperTextItem>
              Example: http://rc-live.tch.harvard.edu:32222/api/v1/
            </HelperTextItem>
          </HelperText>
          <FormGroup label="Compute Resource" isRequired>
            {computeResourceOptions.length > 0 ? (
              <Select
                id="compute_resource"
                selected={computeResource}
                onSelect={(_e, value) => {
                  setComputeResource(value as string);
                  setDropdown(false);
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => {
                      setDropdown(!dropdown);
                    }}
                    isExpanded={dropdown}
                    style={{ width: "200px" }}
                  >
                    {computeResource}
                  </MenuToggle>
                )}
                isOpen={dropdown}
              >
                {computeResourceOptions.map((resource) => (
                  <SelectOption key={resource} value={resource}>
                    {resource}
                  </SelectOption>
                ))}
              </Select>
            ) : (
              <TextInput
                id="compute_resource"
                isRequired
                type="text"
                value={computeResource}
                onChange={(_event, value: string) => setComputeResource(value)}
              />
            )}
          </FormGroup>
          <ActionGroup>
            <Button
              type="submit"
              variant="primary"
              isDisabled={
                !username || !password || !tempURLValue || !computeResource
              }
            >
              Save
            </Button>
            <Button onClick={() => setIsConfigModalOpen(false)} variant="link">
              Cancel
            </Button>
          </ActionGroup>
        </Form>
      </Modal>

      <PageSection>
        <div>
          <Text component={TextVariants.h6}>
            You are currently viewing plugins fetched from {configureURL}
          </Text>
          <Button
            style={{ marginTop: "1em" }}
            variant="secondary"
            onClick={() => setIsConfigModalOpen(true)}
          >
            Configure the store
          </Button>
        </div>

        <Grid style={{ marginTop: "1em", marginBottom: "1em" }}>
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
        {isError && <Alert type="error" description={error.message} closable />}

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
                          <p style={{ fontSize: "0.9em", fontWeight: "bold" }}>
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
                      <p style={{ fontSize: "0.90rem" }}>
                        {format(
                          new Date(plugin.data.modification_date),
                          "do MMMM, yyyy",
                        )}
                      </p>
                      <p style={{ fontSize: "0.90rem", marginTop: "1em" }}>
                        Version:{" "}
                        <VersionSelect
                          handlePluginVersion={(selectedVersion: any) => {
                            setVersion({
                              ...version,
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
                            style={{ marginRight: "0.5em" }}
                            status="success"
                          >
                            <CheckCircleIcon />
                          </Icon>
                          <div>Installed</div>
                        </div>
                      ) : (
                        <Button
                          icon={
                            installingPlugin?.data.id === plugin.data.id &&
                            handleInstallMutation.isPending && <Spin />
                          }
                          style={{ marginTop: "1em" }}
                          onClick={() => {
                            setInstallingPlugin(plugin);
                            if (
                              username &&
                              password &&
                              computeResource &&
                              configureURL
                            ) {
                              handleSave(plugin);
                            } else {
                              setIsConfigModalOpen(true);
                            }
                          }}
                          isDisabled={
                            installingPlugin?.data.id === plugin.data.id &&
                            handleInstallMutation.isPending
                          }
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
