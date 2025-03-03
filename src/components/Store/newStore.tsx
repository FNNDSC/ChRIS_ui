import type { ComputeResource } from "@fnndsc/chrisapi";
import { Grid, GridItem } from "@patternfly/react-core";
import { message } from "antd";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import Wrapper from "../Wrapper";
import { PluginCard } from "./PluginCard";
import { StoreConfigModal } from "./StoreConfigModal";
import { StoreSearchBar } from "./StoreSearchBar";
import { aggregatePlugins } from "./utils/aggregatePlugins";
import type { Plugin } from "./utils/types";
import { useComputeResources } from "./utils/useComputeResources";
import { useInfiniteScroll } from "./utils/useInfiniteScroll";
import {
  useBulkInstaller,
  usePluginInstaller,
} from "./utils/usePluginInstallationHooks";
import { useStorePlugins } from "./utils/useStorePlugins";

const envOptions: Record<string, string> = {
  "PUBLIC CHRIS": "https://cube.chrisproject.org/api/v1/plugins",
};

const LOCAL_CUBE_URL = import.meta.env.VITE_CHRIS_UI_URL || "";

const NewStore: React.FC = () => {
  const { isStaff, isLoggedIn } = useAppSelector((state) => state.user);

  const [selectedEnv, setSelectedEnv] = useState("PUBLIC CHRIS");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<
    "name" | "authors" | "category"
  >("name");

  const [aggregatedPlugins, setAggregatedPlugins] = useState<Plugin[]>([]);
  const [versionMap, setVersionMap] = useState<Record<string, Plugin>>({});
  const [selectedPlugins, setSelectedPlugins] = useState<Plugin[]>([]);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [pendingPlugin, setPendingPlugin] = useState<Plugin | null>(null);
  const [pendingPlugins, setPendingPlugins] = useState<Plugin[]>([]);
  const [modalError, setModalError] = useState("");
  const [isBulkInstalling, setIsBulkInstalling] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const {
    data: pluginData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useStorePlugins(selectedEnv, envOptions, searchTerm, searchField);

  const computeResourceOptions = useComputeResources(isLoggedIn);
  const installPluginMutation = usePluginInstaller();
  const bulkInstall = useBulkInstaller(installPluginMutation);

  useInfiniteScroll(observerTarget, { fetchNextPage, hasNextPage });

  // Aggregate plugin data
  useEffect(() => {
    if (pluginData) {
      const results = pluginData.pages.flatMap((page) => page.results);
      setAggregatedPlugins(aggregatePlugins(results));
    }
  }, [pluginData]);

  // Show a small "info" message while fetching more
  useEffect(() => {
    if (isFetchingNextPage) {
      message.info("Fetching more plugins...");
    }
  }, [isFetchingNextPage]);

  // Close modal on successful single install (unless skipMessage was used)
  useEffect(() => {
    if (
      installPluginMutation.isSuccess &&
      !installPluginMutation.variables?.skipMessage
    ) {
      setModalError("");
      setIsConfigModalOpen(false);
      setPendingPlugin(null);
    }
  }, [installPluginMutation.isSuccess, installPluginMutation.variables]);

  // Show installation error in modal
  useEffect(() => {
    if (installPluginMutation.isError && isConfigModalOpen) {
      setModalError(
        (installPluginMutation.error as Error)?.message ||
          "Unknown plugin installation error.",
      );
    }
  }, [
    installPluginMutation.isError,
    installPluginMutation.error,
    isConfigModalOpen,
  ]);

  // Clear selected plugins if searchTerm changes
  useEffect(() => {
    setSelectedPlugins([]);
  }, [searchTerm]);

  const toggleSelectPlugin = useCallback(
    (plugin: Plugin) => {
      if (!isLoggedIn) return;
      setSelectedPlugins((prev) => {
        const alreadySelected = prev.some((p) => p.id === plugin.id);
        return alreadySelected
          ? prev.filter((p) => p.id !== plugin.id)
          : [...prev, plugin];
      });
    },
    [isLoggedIn],
  );

  const onInstallPlugin = useCallback(
    async (plugin: Plugin, computeResource: ComputeResource) => {
      if (!isLoggedIn) {
        message.warning("You must be logged in to install plugins.");
        return;
      }
      if (isStaff) {
        const tokenAuth = `Token ${ChrisAPIClient.getClient().auth.token}`;
        installPluginMutation.mutate({
          plugin,
          authorization: tokenAuth,
          computeResource,
        });
      } else {
        setPendingPlugin(plugin);
        setModalError("");
        setIsConfigModalOpen(true);
      }
    },
    [isLoggedIn, isStaff, installPluginMutation],
  );

  /**
   * If user has selected any plugins => install those.
   * Otherwise => install entire search result list (aggregatedPlugins).
   */
  const handleBulkInstall = useCallback(() => {
    if (!isLoggedIn) {
      message.warning("You must be logged in to install plugins.");
      return;
    }
    const pluginsToInstall = selectedPlugins.length
      ? selectedPlugins
      : aggregatedPlugins;

    if (!pluginsToInstall.length) return;

    if (isStaff) {
      const tokenAuth = `Token ${ChrisAPIClient.getClient().auth.token}`;
      if (!computeResourceOptions?.[0]) {
        message.error("No compute resources available for bulk install.");
        return;
      }
      setIsBulkInstalling(true);
      bulkInstall(
        pluginsToInstall,
        tokenAuth,
        computeResourceOptions[0],
        (pct) => {
          setBulkProgress(pct);
        },
      ).finally(() => {
        setIsBulkInstalling(false);
      });
    } else {
      setPendingPlugins(pluginsToInstall);
      setModalError("");
      setIsConfigModalOpen(true);
    }
  }, [
    isLoggedIn,
    selectedPlugins,
    aggregatedPlugins,
    isStaff,
    computeResourceOptions,
    bulkInstall,
  ]);

  const handleConfigSave = useCallback(
    async ({ username, password }: { username: string; password: string }) => {
      if (!pendingPlugin && !pendingPlugins.length) return;
      const adminURL = LOCAL_CUBE_URL.replace(
        "/api/v1/",
        "/chris-admin/api/v1/",
      );
      if (!adminURL) {
        setModalError("Please provide a valid chris-admin URL.");
        return;
      }
      const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
      const authorization = `Basic ${adminCredentials}`;
      if (!computeResourceOptions?.[0]) {
        setModalError("No compute resources found. Please try again.");
        return;
      }
      const resource = computeResourceOptions[0];

      // Bulk
      if (pendingPlugins.length > 0) {
        setIsBulkInstalling(true);
        await bulkInstall(pendingPlugins, authorization, resource, (pct) => {
          setBulkProgress(pct);
        });
        setPendingPlugins([]);
        setIsConfigModalOpen(false);
        setIsBulkInstalling(false);
      }
      // Single
      else if (pendingPlugin) {
        installPluginMutation.mutate({
          plugin: pendingPlugin,
          authorization,
          computeResource: resource,
        });
      }
    },
    [
      pendingPlugin,
      pendingPlugins,
      computeResourceOptions,
      installPluginMutation,
      bulkInstall,
    ],
  );

  const multipleSelected = selectedPlugins.length > 1;
  const multipleSearchResults =
    searchTerm.trim() !== "" && aggregatedPlugins.length > 1;

  // Whether "Install All" is enabled
  const canBulkInstall =
    isLoggedIn && (multipleSelected || multipleSearchResults);

  const selectedCount = selectedPlugins.length;
  const fetchedCount = aggregatedPlugins.length;

  return (
    <Wrapper>
      <>
        <StoreSearchBar
          environment={selectedEnv}
          environmentOptions={envOptions}
          onEnvChange={setSelectedEnv}
          initialSearchTerm={searchTerm}
          initialSearchField={searchField}
          onChange={(term, field) => {
            setSearchTerm(term);
            setSearchField(field);
          }}
          canBulkInstall={canBulkInstall}
          onBulkInstall={handleBulkInstall}
          isBulkInstalling={isBulkInstalling}
          bulkProgress={bulkProgress}
          selectedCount={selectedCount}
          fetchedCount={fetchedCount}
          isLoggedIn={isLoggedIn}
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
                    computeResourceOptions={
                      isLoggedIn ? computeResourceOptions : undefined
                    }
                    isLoggedIn={isLoggedIn}
                  />
                </GridItem>
              );
            })}
          </Grid>
        )}

        <div ref={observerTarget} style={{ margin: "1rem 0" }} />

        {isLoggedIn && !isStaff && (
          <StoreConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => {
              setIsConfigModalOpen(false);
              setModalError("");
              setPendingPlugin(null);
              setPendingPlugins([]);
            }}
            onSave={handleConfigSave}
            modalError={modalError}
          />
        )}
      </>
    </Wrapper>
  );
};

export default NewStore;
