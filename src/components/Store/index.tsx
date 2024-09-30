import Client, { type Plugin } from "@fnndsc/chrisapi";
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
import { isEmpty } from "lodash";
import { type Ref, useEffect, useState } from "react";
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
  const queryClient = useQueryClient();
  const [_cookie, setCookie] = useCookies();
  const [api, contextHolder] = notification.useNotification();
  const [version, setVersion] = useState<Record<string, any>>({});
  const [installingPlugin, setInstallingPlugin] = useState<
    { data: any } | undefined
  >(undefined);
  const [enterAdminCred, setEnterAdminCred] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [tempURLValue, setTempURLValue] = useState("");
  const [configureURL, setConfigureURL] = useState("");
  const [configureStore, setConfigureStore] = useState(false);

  const defaultStoreURL = import.meta.env.VITE_CHRIS_STORE_URL;
  const cookies = new Cookies();
  const cookie_username = cookies.get("admin_username");
  const cookie_password = cookies.get("admin_password");
  const configure_url = cookies.get("configure_url");

  useEffect(() => {
    document.title = "Store Catalog";
    setUsername(cookie_username || "");
    setPassword(cookie_password || "");
    setConfigureURL(configure_url || defaultStoreURL);
  }, [cookie_username, cookie_password, configure_url, defaultStoreURL]);

  const fetchPlugins = async (search: string) => {
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
  };

  const fetchExistingPlugins = async () => {
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
  };

  const handleInstall = async (selectedPlugin: Plugin) => {
    const adminURL = import.meta.env.VITE_CHRIS_UI_URL.replace(
      "/api/v1/",
      "/chris-admin/api/v1/",
    );
    if (!adminURL)
      throw new Error("Please provide a link to your chris-admin url");

    const client = ChrisAPIClient.getClient();
    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
    const nonAdminCredentials = `Token ${client.auth.token}`;
    const authorization = !isStaff
      ? `Basic ${adminCredentials}`
      : nonAdminCredentials;

    try {
      const data = await handleInstallPlugin(authorization, selectedPlugin);
      setCookie("admin_username", username, { path: "/", maxAge: 86400 });
      setCookie("admin_password", password, { path: "/", maxAge: 86400 });
      return data;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const handleInstallMutation = useMutation({
    mutationFn: (selectedPlugin: Plugin) => handleInstall(selectedPlugin),
    onSettled: (_data, error) => {
      if (!isEmpty(error)) {
        setInstallingPlugin(undefined);
        setEnterAdminCred(false);
      }
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

  useEffect(() => {
    if (handleInstallMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["existingStorePlugins"] });
      api.success({ message: "Plugin Successfully installed..." });
    }

    if (handleInstallMutation.isError) {
      api.error({
        message: "Failed to Install the plugin",
        description: handleInstallMutation.error.message,
      });
    }
  }, [
    handleInstallMutation.isSuccess,
    handleInstallMutation.isError,
    api,
    queryClient,
  ]);

  const TitleComponent = (
    <InfoSection
      title="Plugin Store"
      content="This is a global store from where you can install your plugins."
    />
  );

  const handleStoreURLConfiguration = (tempURL: string) => {
    setConfigureURL(tempURL);
    setCookie("configure_url", tempURL, { path: "/" });
    setConfigureStore(false);
  };

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      {contextHolder}
      <Modal
        variant="small"
        isOpen={enterAdminCred}
        onClose={() => setEnterAdminCred(false)}
        aria-label="Enter admin credentials"
      >
        <Form isWidthLimited>
          <FormGroup label="Enter a username" isRequired>
            <TextInput
              id="username"
              isRequired
              type="text"
              value={username}
              onChange={(_event, value: string) => setUsername(value)}
            />
          </FormGroup>
          <FormGroup label="Enter a password" isRequired>
            <TextInput
              id="password"
              isRequired
              type="password"
              value={password}
              onChange={(_event, value: string) => setPassword(value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </FormGroup>
          <ActionGroup>
            <Button
              onClick={handleSave}
              isDisabled={!(username && password)}
              variant="primary"
              icon={handleInstallMutation.isPending && <Spin />}
            >
              Submit
            </Button>
            <Button onClick={() => setEnterAdminCred(false)} variant="link">
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

      <Modal
        isOpen={configureStore}
        variant="small"
        aria-label="Configure a store"
        onClose={() => setConfigureStore(false)}
      >
        <Form isWidthLimited>
          <FormGroup label="Enter the URL to your store" isRequired>
            <TextInput
              id="temp_url"
              value={tempURLValue}
              defaultValue="http://rc-live.tch.harvard.edu:32222/api/v1/"
              onChange={(_e, value) => setTempURLValue(value)}
              name="configureStore"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleStoreURLConfiguration(tempURLValue);
                }
              }}
            />
          </FormGroup>
          <HelperText>
            <HelperTextItem>
              Example: http://rc-live.tch.harvard.edu:32222/api/v1/
            </HelperTextItem>
          </HelperText>
          <ActionGroup>
            <Button onClick={() => handleStoreURLConfiguration(tempURLValue)}>
              Confirm
            </Button>
            <Button variant="link" onClick={() => setConfigureStore(false)}>
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
            onClick={() => setConfigureStore(true)}
          >
            Connect to different store url
          </Button>
        </div>

        <Grid style={{ marginTop: "1em" }}>
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
                            setVersion({ [plugin.data.id]: selectedVersion });
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
                            isStaff &&
                            installingPlugin?.data.id === plugin.data.id &&
                            handleInstallMutation.isPending && <Spin />
                          }
                          style={{ marginTop: "1em" }}
                          onClick={() => {
                            setInstallingPlugin(plugin);
                            if (isStaff) {
                              handleSave(plugin);
                            } else {
                              setEnterAdminCred(true);
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
