import React from "react";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { notification } from "antd";

import Wrapper from "../Wrapper";
import { useAppSelector } from "../../store/hooks";
import ChrisAPIClient from "../../api/chrisapiclient";
import { SpinContainer } from "../Common";

// Internal imports
import { useStorePlugins } from "./utils/useStorePlugins";
import { useComputeResources } from "./utils/useComputeResources";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import { aggregatePlugins } from "./utils/aggregatePlugins";
import { PluginCard } from "./PluginCard";
import { StoreConfigModal } from "./StoreConfigModal";
import { StoreSearchBar } from "./utils/StoreSearchBar";
import type { Plugin } from "./utils/types";

const envOptions: Record<string, string> = {
  "PUBLIC CHRIS": "https://cube.chrisproject.org/api/v1/plugins",
};

const LOCAL_CUBE_URL = import.meta.env.VITE_CHRIS_UI_URL || "";

const NewStore: React.FC = () => {
  const queryClient = useQueryClient();
  const { isStaff, isLoggedIn } = useAppSelector((state) => state.user);
  const [selectedEnv, setSelectedEnv] = React.useState("PUBLIC CHRIS");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchField, setSearchField] = React.useState<
    "name" | "authors" | "category"
  >("name");

  // ---------------------------
  // 2) FETCH PLUGINS
  // ---------------------------
  const {
    data: pluginData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useStorePlugins(selectedEnv, envOptions, searchTerm, searchField);

  const [aggregatedPlugins, setAggregatedPlugins] = React.useState<Plugin[]>(
    [],
  );

  React.useEffect(() => {
    if (pluginData) {
      const results = pluginData.pages.flatMap((page) => page.results);
      setAggregatedPlugins(aggregatePlugins(results));
    }
  }, [pluginData]);

  // ---------------------------
  // 3) INSTALLATION STATE
  // ---------------------------
  const [versionMap, setVersionMap] = React.useState<Record<string, Plugin>>(
    {},
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<Plugin | null>(null);

  /**
   * We'll store a local error to show in the modal. If staff installation fails,
   * we can still do a global notification, or you can handle it the same way.
   */
  const [modalError, setModalError] = React.useState("");

  // Only fetch resources if logged in
  const computeResourceOptions = useComputeResources(isLoggedIn);

  // The actual function that does the plugin install
  async function doInstall(args: {
    plugin: Plugin;
    authorization: string;
    computeResource: string;
  }) {
    const { plugin, authorization, computeResource } = args;
    return handleInstallPlugin(authorization, plugin, computeResource);
  }

  // React Query installation mutation
  const installPluginMutation = useMutation({
    mutationFn: doInstall,
    onSuccess: (_data, variables) => {
      // Invalidate / refresh
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          variables.plugin.name,
          variables.plugin.version,
        ],
      });
      // Show success globally or in modal
      notification.success({
        message: "Installation Successful",
        description: `${variables.plugin.name} installed on ${variables.computeResource}.`,
      });
      // Clear any modal error
      setModalError("");
      setIsConfigModalOpen(false);
      setPendingPlugin(null);
    },
    // We'll handle `onError` via isError below
  });

  // Destructure the mutation's error state
  const { isError: isInstallError, error: installError } =
    installPluginMutation;

  // If the mutation fails while the modal is open => show the error in the modal
  React.useEffect(() => {
    if (isInstallError && installError && isConfigModalOpen) {
      setModalError(
        (installError as Error).message || "Unknown plugin installation error.",
      );
    }
  }, [isInstallError, installError, isConfigModalOpen]);

  // ---------------------------
  // 4) Called by <PluginCard />
  // ---------------------------
  const onInstallPlugin = async (plugin: Plugin) => {
    if (isStaff) {
      // If staff, we do the mutate immediately
      const client = ChrisAPIClient.getClient();
      const tokenAuth = `Token ${client.auth.token}`;
      const compute = computeResourceOptions.length
        ? computeResourceOptions[0]
        : "host";

      installPluginMutation.mutate({
        plugin,
        authorization: tokenAuth,
        computeResource: compute,
      });
    } else {
      // Non-staff => open the config modal
      setPendingPlugin(plugin);
      setModalError("");
      setIsConfigModalOpen(true);
      // Return a rejected promise so PluginCard doesn't set "Installed" yet
      return Promise.reject("Non-staff: credentials needed");
    }
  };

  // ---------------------------
  // 5) Called after modal "Save"
  // ---------------------------
  const handleConfigSave = async ({
    username,
    password,
    computeResource,
  }: {
    username: string;
    password: string;
    computeResource: string;
  }) => {
    if (!pendingPlugin) return;

    const adminURL = LOCAL_CUBE_URL.replace("/api/v1/", "/chris-admin/api/v1/");
    if (!adminURL) {
      // "Config" error, not an installation error. Show inline or global
      setModalError("Please provide a link to your chris-admin URL.");
      return;
    }

    // Basic authorization
    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
    const authorization = `Basic ${adminCredentials}`;

    // Use the same mutation
    installPluginMutation.mutate({
      plugin: pendingPlugin,
      authorization,
      computeResource,
    });
  };

  return (
    <Wrapper>
      <>
        {/* Search & Env Toolbar */}
        <StoreSearchBar
          environment={selectedEnv}
          environmentOptions={envOptions}
          onEnvChange={(env) => setSelectedEnv(env)}
          initialSearchTerm={searchTerm}
          initialSearchField={searchField}
          onChange={(term, field) => {
            setSearchTerm(term);
            setSearchField(field);
          }}
        />

        {/* Plugin Loading State */}
        {isLoading && (
          <SpinContainer title={`Loading Plugins for ${selectedEnv}...`} />
        )}

        {/* Plugin Error State (fetching the plugin list) */}
        {isError && (
          <div style={{ color: "red", margin: "1rem 0" }}>
            <p>
              Error loading plugins for <strong>{selectedEnv}</strong>.
            </p>
            <p>{(error as Error)?.message}</p>
          </div>
        )}

        {/* If plugin list is loaded */}
        {!isLoading && !isError && (
          <>
            <Grid hasGutter>
              {aggregatedPlugins.map((plugin) => (
                <GridItem key={plugin.id} span={6}>
                  <PluginCard
                    plugin={plugin}
                    versionMap={versionMap}
                    setVersionMap={setVersionMap}
                    onInstall={onInstallPlugin}
                  />
                </GridItem>
              ))}
            </Grid>

            <Button
              variant="primary"
              onClick={() => fetchNextPage()}
              isDisabled={!hasNextPage || isFetchingNextPage}
              style={{ marginTop: "1rem" }}
            >
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                  ? "Load More"
                  : "No more results"}
            </Button>
          </>
        )}

        {/* The modal for non-staff credentials */}
        {!isStaff && (
          <StoreConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => {
              setIsConfigModalOpen(false);
              setModalError("");
              setPendingPlugin(null);
            }}
            onSave={handleConfigSave}
            computeResourceOptions={computeResourceOptions}
            modalError={modalError} // <-- pass the error
          />
        )}
      </>
    </Wrapper>
  );
};

export default NewStore;
