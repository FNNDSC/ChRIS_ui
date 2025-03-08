// NewStore.tsx
import { Grid, GridItem } from "@patternfly/react-core";
import { message } from "antd";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ComputeResource } from "@fnndsc/chrisapi";
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
import { useStorePlugins } from "./utils/useStorePlugins";
import { usePluginInstallManager } from "./utils/usePluginManager";

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
  const [pluginResourceMap, setPluginResourceMap] = useState<
    Record<number, ComputeResource[]>
  >({});

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const { installPlugin, bulkInstallPlugins, modifyComputeResources } =
    usePluginInstallManager();
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

  useInfiniteScroll(observerTarget, { fetchNextPage, hasNextPage });

  useEffect(() => {
    if (pluginData) {
      const results = pluginData.pages.flatMap((page) => page.results);
      setAggregatedPlugins(aggregatePlugins(results));
    }
  }, [pluginData]);

  useEffect(() => {
    if (isFetchingNextPage) {
      message.info("Fetching more plugins...");
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    setSelectedPlugins([]);
  }, [searchTerm]);

  const toggleSelectPlugin = useCallback((plugin: Plugin) => {
    setSelectedPlugins((prev) => {
      const alreadySelected = prev.some((p) => p.id === plugin.id);
      return alreadySelected
        ? prev.filter((p) => p.id !== plugin.id)
        : [...prev, plugin];
    });
  }, []);

  const onInstallPlugin = useCallback(
    async (plugin: Plugin, resources: ComputeResource[]) => {
      if (!isLoggedIn) {
        message.warning("You must be logged in to install plugins.");
        return;
      }
      if (isStaff) {
        const tokenAuth = `Token ${ChrisAPIClient.getClient().auth.token}`;
        installPlugin(plugin, tokenAuth, resources);
      } else {
        setPendingPlugin(plugin);
        setModalError("");
        setIsConfigModalOpen(true);
      }
    },
    [isLoggedIn, isStaff, installPlugin],
  );

  const handleComputeResourceChange = useCallback(
    (pluginId: number, resources: ComputeResource[]) => {
      setPluginResourceMap((prev) => ({
        ...prev,
        [pluginId]: resources,
      }));
    },
    [],
  );

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
      if (!computeResourceOptions?.length) {
        message.error("No compute resources available for bulk install.");
        return;
      }
      setIsBulkInstalling(true);
      bulkInstallPlugins(
        pluginsToInstall,
        tokenAuth,
        pluginResourceMap,
        computeResourceOptions[0],
        (pct) => setBulkProgress(pct),
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
    bulkInstallPlugins,
    pluginResourceMap,
  ]);

  const onModifyComputeResource = useCallback(
    (
      realPlugin: { name: string; version: string; url?: string },
      resources: ComputeResource[],
    ) => {
      if (!isLoggedIn) {
        message.warning("You must be logged in to modify resources.");
        return;
      }
      if (isStaff) {
        const token = ChrisAPIClient.getClient().auth.token;
        const adminCred = `Token ${token}`;
        modifyComputeResources(realPlugin, resources, adminCred);
      } else {
        message.warning(
          "Non-staff: please open the config modal for credentials.",
        );
      }
    },
    [isLoggedIn, isStaff, modifyComputeResources],
  );

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
      if (pendingPlugins.length > 0) {
        setIsBulkInstalling(true);
        await bulkInstallPlugins(
          pendingPlugins,
          authorization,
          pluginResourceMap,
          computeResourceOptions?.[0],
          (pct) => setBulkProgress(pct),
        );
        setPendingPlugins([]);
        setIsConfigModalOpen(false);
        setIsBulkInstalling(false);
      } else if (pendingPlugin) {
        if (!computeResourceOptions?.length) {
          setModalError("No compute resources found. Please try again.");
          return;
        }
        const resources = pluginResourceMap[pendingPlugin.id]?.length
          ? pluginResourceMap[pendingPlugin.id]
          : [computeResourceOptions[0]];
        installPlugin(pendingPlugin, authorization, resources);
      }
    },
    [
      pendingPlugin,
      pendingPlugins,
      computeResourceOptions,
      installPlugin,
      bulkInstallPlugins,
      pluginResourceMap,
    ],
  );

  const multipleSelected = selectedPlugins.length > 1;
  const multipleSearchResults =
    searchTerm.trim() !== "" && aggregatedPlugins.length > 1;
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
                    onModifyResource={onModifyComputeResource}
                    selectedComputeResources={
                      pluginResourceMap[plugin.id] || []
                    }
                    onComputeResourceChange={handleComputeResourceChange}
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
