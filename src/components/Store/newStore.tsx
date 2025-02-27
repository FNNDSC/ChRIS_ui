import React from "react";
import { Button, Grid, GridItem } from "@patternfly/react-core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import Wrapper from "../Wrapper";
import { useAppSelector } from "../../store/hooks";
import ChrisAPIClient from "../../api/chrisapiclient";
import { SpinContainer } from "../Common";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import { PluginCard } from "./PluginCard";
import { StoreConfigModal } from "./StoreConfigModal";
import { StoreSearchBar } from "./StoreSearchBar";
import { aggregatePlugins } from "./utils/aggregatePlugins";
import { useComputeResources } from "./utils/useComputeResources";
import type { Plugin } from "./utils/types";
import { useStorePlugins } from "./utils/useStorePlugins";

const envOptions: Record<string, string> = {
  "PUBLIC CHRIS": "https://cube.chrisproject.org/api/v1/plugins",
};

const LOCAL_CUBE_URL = import.meta.env.VITE_CHRIS_UI_URL || "";

interface InstallArgs {
  plugin: Plugin;
  authorization: string;
  computeResource: string;
  skipMessage?: boolean;
}

const NewStore: React.FC = () => {
  const queryClient = useQueryClient();
  const { isStaff, isLoggedIn } = useAppSelector((state) => state.user);

  // ENV & SEARCH
  const [selectedEnv, setSelectedEnv] = React.useState("PUBLIC CHRIS");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchField, setSearchField] = React.useState<
    "name" | "authors" | "category"
  >("name");

  // FETCH PLUGINS
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

  // We fetch or store the list of compute resources
  // For instance, from your own custom hook "useComputeResources"
  const computeResourceOptions = useComputeResources(isLoggedIn);
  // e.g. => [] initially, later something like ["host", "pfe01", "pfe02"]

  // Keep track of version selection per plugin
  const [versionMap, setVersionMap] = React.useState<Record<string, Plugin>>(
    {},
  );

  // Keep track of user-selected plugins
  const [selectedPlugins, setSelectedPlugins] = React.useState<Plugin[]>([]);
  const toggleSelectPlugin = React.useCallback((plugin: Plugin) => {
    setSelectedPlugins((prev) => {
      const already = prev.find((p) => p.id === plugin.id);
      return already
        ? prev.filter((p) => p.id !== plugin.id)
        : [...prev, plugin];
    });
  }, []);

  // INSTALLATION STATE
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<Plugin | null>(null);
  const [pendingPlugins, setPendingPlugins] = React.useState<Plugin[]>([]);
  const [modalError, setModalError] = React.useState("");

  // Bulk progress
  const [isBulkInstalling, setIsBulkInstalling] = React.useState(false);
  const [bulkProgress, setBulkProgress] = React.useState(0);

  // Plugin INSTALL logic
  async function doInstall(args: InstallArgs) {
    const { plugin, authorization, computeResource } = args;
    return handleInstallPlugin(authorization, plugin, computeResource);
  }

  const installPluginMutation = useMutation({
    mutationFn: doInstall,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          variables.plugin.name,
          variables.plugin.version,
        ],
      });

      if (!variables.skipMessage) {
        message.success(
          `Installed ${variables.plugin.name} on ${variables.computeResource}.`,
        );
      }
      setModalError("");
      setIsConfigModalOpen(false);
      setPendingPlugin(null);
    },
  });

  const { isError: isInstallError, error: installError } =
    installPluginMutation;
  React.useEffect(() => {
    if (isInstallError && installError && isConfigModalOpen) {
      setModalError(
        (installError as Error)?.message ||
          "Unknown plugin installation error.",
      );
    }
  }, [isInstallError, installError, isConfigModalOpen]);

  // Single install
  const onInstallPlugin = async (plugin: Plugin, computeResource: string) => {
    if (isStaff) {
      const client = ChrisAPIClient.getClient();
      const tokenAuth = `Token ${client.auth.token}`;
      installPluginMutation.mutate({
        plugin,
        authorization: tokenAuth,
        computeResource,
      });
    } else {
      setPendingPlugin(plugin);
      setModalError("");
      setIsConfigModalOpen(true);
      return Promise.reject("Non-staff: credentials needed");
    }
  };

  // Bulk install
  async function bulkInstallPlugins(
    pluginsToInstall: Plugin[],
    authorization: string,
    computeResource: string,
  ) {
    const total = pluginsToInstall.length;
    let completedCount = 0;

    setIsBulkInstalling(true);
    setBulkProgress(0);

    const allPromises = pluginsToInstall.map((pl) => {
      return installPluginMutation
        .mutateAsync({
          plugin: pl,
          authorization,
          computeResource,
          skipMessage: true,
        })
        .catch(() => {
          // ignore
        })
        .finally(() => {
          completedCount++;
          setBulkProgress(Math.round((completedCount / total) * 100));
        });
    });
    const results = await Promise.allSettled(allPromises);
    setIsBulkInstalling(false);

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = total - successCount;

    if (failCount > 0) {
      message.info(
        `Bulk install complete: ${successCount} succeeded, ${failCount} failed.`,
      );
    } else {
      message.success(
        `Bulk install complete! All ${successCount} plugin(s) installed successfully.`,
      );
    }
  }

  // "Install All" => selected or entire search results
  const handleBulkInstall = async () => {
    const pluginsToInstall = selectedPlugins.length
      ? selectedPlugins
      : aggregatedPlugins;
    if (!pluginsToInstall.length) return;

    if (isStaff) {
      const client = ChrisAPIClient.getClient();
      const tokenAuth = `Token ${client.auth.token}`;
      // For bulk, pick the *first* resource or "host" if none
      const compute = computeResourceOptions.length
        ? computeResourceOptions[0]
        : "host";
      await bulkInstallPlugins(pluginsToInstall, tokenAuth, compute);
    } else {
      setPendingPlugins(pluginsToInstall);
      setModalError("");
      setIsConfigModalOpen(true);
    }
  };

  // Non-staff modal => single or bulk
  const handleConfigSave = async ({
    username,
    password,
    computeResource,
  }: {
    username: string;
    password: string;
    computeResource: string;
  }) => {
    if (!pendingPlugin && !pendingPlugins.length) return;

    const adminURL = LOCAL_CUBE_URL.replace("/api/v1/", "/chris-admin/api/v1/");
    if (!adminURL) {
      setModalError("Please provide a valid chris-admin URL.");
      return;
    }

    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
    const authorization = `Basic ${adminCredentials}`;

    if (pendingPlugins.length > 0) {
      await bulkInstallPlugins(pendingPlugins, authorization, computeResource);
      setPendingPlugins([]);
      setIsConfigModalOpen(false);
      return;
    }

    if (pendingPlugin) {
      installPluginMutation.mutate({
        plugin: pendingPlugin,
        authorization,
        computeResource,
      });
    }
  };

  // Show "Install All" if multiple selected or multiple search results
  const multipleSelected = selectedPlugins.length > 1;
  const multipleSearchResults =
    searchTerm.trim() !== "" && aggregatedPlugins.length > 1;
  const canBulkInstall = multipleSelected || multipleSearchResults;
  const selectedCount = selectedPlugins.length;

  return (
    <Wrapper>
      <>
        <StoreSearchBar
          environment={selectedEnv}
          environmentOptions={envOptions}
          onEnvChange={(env: string) => setSelectedEnv(env)}
          initialSearchTerm={searchTerm}
          initialSearchField={searchField}
          onChange={(term: string, field: "name" | "authors" | "category") => {
            setSearchTerm(term);
            setSearchField(field);
          }}
          canBulkInstall={canBulkInstall}
          onBulkInstall={handleBulkInstall}
          isBulkInstalling={isBulkInstalling}
          bulkProgress={bulkProgress}
          selectedCount={selectedCount}
        />

        {isLoading && (
          <SpinContainer title={`Loading Plugins for ${selectedEnv}...`} />
        )}

        {isError && (
          <div style={{ color: "red", margin: "1rem 0" }}>
            <p>
              Error loading plugins for <strong>{selectedEnv}</strong>.
            </p>
            <p>{(error as Error)?.message}</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Grid hasGutter>
              {aggregatedPlugins.map((plugin) => {
                const isSelected = selectedPlugins.some(
                  (p) => p.id === plugin.id,
                );
                return (
                  <GridItem key={plugin.id} span={6}>
                    <PluginCard
                      plugin={plugin}
                      versionMap={versionMap}
                      setVersionMap={setVersionMap}
                      onInstall={onInstallPlugin}
                      onSelect={toggleSelectPlugin}
                      isSelected={isSelected}
                      computeResourceOptions={computeResourceOptions} // Pass resources
                    />
                  </GridItem>
                );
              })}
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

        {/* Non-staff modal */}
        {!isStaff && (
          <StoreConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => {
              setIsConfigModalOpen(false);
              setModalError("");
              setPendingPlugin(null);
              setPendingPlugins([]);
            }}
            onSave={handleConfigSave}
            computeResourceOptions={computeResourceOptions}
            modalError={modalError}
          />
        )}
      </>
    </Wrapper>
  );
};

export default NewStore;
