import React from "react";
import {
  Button,
  Grid,
  GridItem,
  MenuToggle,
  Dropdown,
  DropdownGroup,
  DropdownList,
  DropdownItem,
  Spinner,
} from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";

import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppSelector } from "../../store/hooks";
import { handleInstallPlugin } from "../PipelinesCopy/utils";
import Wrapper from "../Wrapper";

import { PluginCard } from "./PluginCard";
import { StoreConfigModal } from "./StoreConfigModal";
import { useComputeResources } from "./utils/useComputeResources";
import { useStorePlugins } from "./utils/useStorePlugins";

import { aggregatePlugins } from "./utils/aggregatePlugins";
import type { Plugin } from "./utils/types";
import { SpinContainer } from "../Common";

// A record of environment names -> store URLs
const envOptions: Record<string, string> = {
  "PUBLIC CHRIS": "https://cube.chrisproject.org/api/v1/plugins",
  "INTERNAL CHRIS": "https://internal.example.com/api/v1/plugins",
  "EXTERNAL CHRIS": "https://external.example.com/api/v1/plugins",
};

// For example, from .env
const LOCAL_CUBE_URL = import.meta.env.VITE_CHRIS_UI_URL || "";

const NewStore: React.FC = () => {
  const queryClient = useQueryClient();
  const { isStaff } = useAppSelector((state) => state.user);

  // Track which environment is selected
  const [selectedEnv, setSelectedEnv] = React.useState("PUBLIC CHRIS");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Keep track of which version the user selected for each plugin
  const [versionMap, setVersionMap] = React.useState<Record<string, Plugin>>(
    {},
  );

  // We'll store the aggregated plugin data here
  const [aggregatedPlugins, setAggregatedPlugins] = React.useState<Plugin[]>(
    [],
  );

  // For non-staff: open a config modal to get credentials
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [pendingPlugin, setPendingPlugin] = React.useState<Plugin | null>(null);

  // 1) React Query: fetch infinite pages of plugins, keyed by `selectedEnv`
  const {
    data: pluginData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,

    // React Query states for loading/error
    isLoading, // True if query is in initial loading state
    isError, // True if query encountered an error
    error, // The actual error object
  } = useStorePlugins(selectedEnv, envOptions);

  // 2) Fetch available compute resources (chris API)
  const computeResourceOptions = useComputeResources();

  // 3) Whenever pluginData changes, aggregate versions
  React.useEffect(() => {
    if (pluginData) {
      const results = pluginData.pages.flatMap((page) => page.results);
      setAggregatedPlugins(aggregatePlugins(results));
    }
  }, [pluginData]);

  /**
   * Called when user installs a plugin:
   * - If staff => automatically install with token & default compute resource
   * - If non-staff => open modal for credentials
   */
  const onInstallPlugin = async (plugin: Plugin) => {
    if (isStaff) {
      const client = ChrisAPIClient.getClient();
      const tokenAuth = `Token ${client.auth.token}`;
      const compute = computeResourceOptions.length
        ? computeResourceOptions[0]
        : "host";

      // Return so we can await in the child
      return handleInstallPlugin(tokenAuth, plugin, compute)
        .then(() => {
          console.log("Installation successful for plugin:", plugin.name);
        })
        .catch((error) => {
          console.error("Installation failed:", error);
          throw error;
        });
    }
    // Non-staff => open modal (no immediate install)
    setIsConfigModalOpen(true);
    setPendingPlugin(plugin);

    // Return a rejected promise so the child doesn't set "Installed"
    return Promise.reject("Non-staff: credentials needed");
  };

  /**
   * Called after non-staff user enters credentials in the modal
   */
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
      throw new Error("Please provide a link to your chris-admin URL");
    }

    const adminCredentials = btoa(`${username.trim()}:${password.trim()}`);
    const authorization = `Basic ${adminCredentials}`;

    try {
      await handleInstallPlugin(authorization, pendingPlugin, computeResource);
      // Invalidate the plugin-installation query so it re-checks
      queryClient.invalidateQueries({
        queryKey: [
          "pluginInstallationStatus",
          pendingPlugin.name,
          pendingPlugin.version,
        ],
      });
      console.log("Installation successful for plugin:", pendingPlugin.name);
    } catch (error) {
      console.error("Installation failed:", error);
    } finally {
      setPendingPlugin(null);
    }
  };

  /**
   * Environment selection dropdown handlers
   */
  const onSelectEnv = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value?: string | number | undefined,
  ) => {
    if (typeof value === "string") {
      setSelectedEnv(value);
    }
    setIsDropdownOpen(false);
  };

  const onToggleClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Build the grouped dropdown items
  const dropdownContent = (
    <DropdownGroup label="Select Environment" labelHeadingLevel="h3">
      <DropdownList>
        {Object.keys(envOptions).map((envKey) => (
          <DropdownItem
            value={envKey}
            key={envKey}
            isSelected={envKey === selectedEnv}
          >
            {envKey}
          </DropdownItem>
        ))}
      </DropdownList>
    </DropdownGroup>
  );

  /**
   * Render:
   * 1) The environment dropdown
   * 2) If loading: show spinner or "Loading..."
   * 3) If error: show error message
   * 4) Else show the plugin grid + "Load more" button
   */
  return (
    <Wrapper>
      <>
        {/* Environment Selection */}
        <div style={{ marginBottom: "1rem" }}>
          <Dropdown
            isOpen={isDropdownOpen}
            onSelect={onSelectEnv}
            onOpenChange={(open) => setIsDropdownOpen(open)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={onToggleClick}
                isExpanded={isDropdownOpen}
              >
                {selectedEnv}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            {dropdownContent}
          </Dropdown>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <SpinContainer title={`Loading Plugins for ${selectedEnv}...`} />
        )}

        {/* ERROR STATE */}
        {isError && (
          <div style={{ color: "red", margin: "1rem 0" }}>
            <p>
              Error loading plugins for <strong>{selectedEnv}</strong>.
            </p>
            <p>{error.message}</p>
          </div>
        )}

        {/* MAIN CONTENT WHEN LOADED & NO ERROR */}
        {!isLoading && !isError && (
          <>
            {/* Plugin Grid */}
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

            {/* "Load More" pagination button */}
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

        {/* Show the config modal only if non-staff */}
        {!isStaff && (
          <StoreConfigModal
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            onSave={handleConfigSave}
            computeResourceOptions={computeResourceOptions}
          />
        )}
      </>
    </Wrapper>
  );
};

export default NewStore;
