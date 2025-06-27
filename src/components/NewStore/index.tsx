/**
 * @file index.tsx
 * @author FNNDSC / Chris UI Team
 * @description React component for the Plugin Store page.
 *              Displays all ChRIS store plugins and allows for installation.
 */

import type React from "react";
import { useMemo, useState, useRef, useCallback } from "react";
import type { Plugin } from "@fnndsc/chrisapi";
import {
  Button,
  Grid,
  GridItem,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { useAppSelector } from "../../store/hooks";
import { InfoSection, SpinContainer } from "../Common";
import Wrapper from "../Wrapper";
import PluginCard from "./PluginCard";
import StoreToggle from "./StoreToggle";
import { StoreConfigModal } from "./StoreConfigModal";
import {
  envOptions,
  type StorePlugin,
  useFetchPlugins,
} from "./hooks/useFetchPlugins";
import { aggregatePlugins } from "./hooks/useFetchPlugins";
import { useComputeResources } from "./hooks/useFetchCompute";
import type { ComputeResource } from "@fnndsc/chrisapi";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import {
  useStoreAuthentication,
  usePluginInstallation,
  usePluginSelection,
} from "./hooks";

/**
 * Constants for configuration
 */
const DEFAULT_SEARCH_FIELD = "name";

/**
 * @component Store
 * @description A marketplace interface for discovering and installing ChRIS plugins
 * from various environments (PUBLIC ChRIS, local development, etc.). Provides functionality
 * for searching, browsing, and installing plugins with appropriate compute resources.
 *
 * Features:
 * - Plugin discovery from multiple environments
 * - Search functionality
 * - Installation of individual or multiple plugins
 * - Authentication management for plugin operations
 * - Compute resource assignment
 * - Infinite scroll for large plugin lists
 *
 * @returns {JSX.Element} The rendered Store component
 */
const Store: React.FC = () => {
  /**
   * ==========================================
   * STATE MANAGEMENT
   * ==========================================
   */

  /** User authentication state from Redux store */
  const { isStaff, isLoggedIn } = useAppSelector((state) => state.user);

  /** Current selected environment for plugin discovery */
  const [selectedEnv, setSelectedEnv] = useState<string>("PUBLIC ChRIS");

  /** Search term for filtering plugins */
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Initialize installation and selection hooks first
  const selection = usePluginSelection();
  const installation = usePluginInstallation();

  // Initialize authentication hook with callbacks to installation methods
  const authentication = useStoreAuthentication(
    async (plugin, resources, isModify, authHeader) => {
      // Handle authenticated operations after modal confirmation
      if (isModify) {
        await installation.handleModify(
          plugin as Plugin,
          resources,
          authHeader,
        );
      } else {
        await installation.handleInstall(
          plugin as StorePlugin,
          resources,
          authHeader,
        );
      }
    },
  );

  /**
   * ==========================================
   * DATA FETCHING AND PROCESSING
   * ==========================================
   */

  /** Fetch plugins with search and pagination */
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchPlugins(
    selectedEnv,
    envOptions,
    searchTerm,
    DEFAULT_SEARCH_FIELD,
  );

  /** Fetch available compute resources */
  const { data: computeList } = useComputeResources(isLoggedIn);

  /**
   * ==========================================
   * EVENT HANDLERS
   * ==========================================
   */

  /**
   * Reset stored authentication credentials
   */
  const resetCredentials = () => {
    authentication.resetCredentials();
    authentication.closeModal();
  };

  /**
   * ==========================================
   * DATA TRANSFORMATIONS AND MEMOIZATION
   * ==========================================
   */

  /** Raw plugin data from API */
  const rawPlugins: Plugin[] = useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data],
  );

  /** Aggregated plugins with duplicates processed */
  const allPlugins: StorePlugin[] = useMemo(
    () => aggregatePlugins(rawPlugins),
    [rawPlugins],
  );

  /** Default compute resource for installations */
  const defaultResource = computeList?.[0];

  /**
   * Install all plugins in the current view
   * Now using the hook's installAllPlugins method
   */
  const installAllPlugins = useCallback(() => {
    if (allPlugins.length > 0) {
      installation.installAllPlugins(
        allPlugins,
        (pluginId) =>
          selection.getResourcesForPlugin(pluginId, defaultResource),
        (plugin, resources) =>
          authentication.getAuthHeaderOrPrompt(plugin, resources, false),
      );
    }
  }, [allPlugins, defaultResource, authentication, installation, selection]);

  /**
   * Handle installation of a single plugin
   * Now using the hook authentication and installation methods
   *
   * @param {StorePlugin} plugin - Plugin to install
   * @param {ComputeResource[]} resources - Compute resources to associate with the plugin
   * @returns {Promise<void>}
   */
  const handleInstall = useCallback(
    async (plugin: StorePlugin, resources: ComputeResource[]) => {
      // This will either return the auth header or trigger the modal
      const authHeader = authentication.getAuthHeaderOrPrompt(
        plugin,
        resources,
        false,
      );

      // If authHeader is returned (staff users or previously authenticated users),
      // immediately process the installation
      if (authHeader) {
        await installation.handleInstall(plugin, resources, authHeader);
      }
      // If null is returned, the modal is shown and onPluginOperation callback
      // in useStoreAuthentication will handle the installation after authentication
    },
    [authentication, installation],
  );

  /**
   * Handle modification of compute resources for an existing plugin
   * Now using the hook authentication and installation methods
   *
   * @param {Plugin} plugin - Plugin to modify
   * @param {ComputeResource[]} resources - New compute resources to associate
   * @returns {Promise<void>}
   */
  const handleModify = useCallback(
    async (plugin: Plugin, resources: ComputeResource[]) => {
      // This will either return the auth header or trigger the modal
      const authHeader = authentication.getAuthHeaderOrPrompt(
        plugin,
        resources,
        true,
      );

      // If authHeader is returned (staff users or previously authenticated users),
      // immediately process the modification
      if (authHeader) {
        await installation.handleModify(plugin, resources, authHeader);
      }
      // If null is returned, the modal is shown and onPluginOperation callback
      // in useStoreAuthentication will handle the modification after authentication
    },
    [authentication, installation],
  );

  /**
   * Track compute resource selections for each plugin
   * Now using the selection hook
   *
   * @param {string} pluginId - Plugin identifier
   * @param {ComputeResource[]} resources - Selected compute resources
   */
  const handleResourcesChange = useCallback(
    (pluginId: string, resources: ComputeResource[]) => {
      selection.handleResourcesChange(pluginId, resources);
    },
    [selection],
  );

  /** Determine if the Install All button should be shown */
  const showInstallAll =
    isLoggedIn && searchTerm.trim() !== "" && rawPlugins.length > 0;

  /** Reference for infinite scroll observer */
  const observerTarget = useRef<HTMLDivElement | null>(null);

  /** Set up infinite scroll */
  useInfiniteScroll(observerTarget, { fetchNextPage, hasNextPage });

  /**
   * ==========================================
   * RENDERING
   * ==========================================
   */

  return (
    <>
      {/* Main wrapper with title */}
      <Wrapper
        titleComponent={
          <InfoSection title="Store" content="Work in Progress" />
        }
      >
        {/*
         * Search and filter toolbar
         * Contains environment selector, search input, and action buttons
         */}
        <Toolbar isSticky id="store-toolbar" clearAllFilters={() => {}}>
          <ToolbarGroup
            variant="filter-group"
            spaceItems={{ default: "spaceItemsMd" }}
          >
            {/* Environment toggle component */}
            <ToolbarItem>
              <StoreToggle onEnvironmentChange={setSelectedEnv} />
            </ToolbarItem>
            {/* Search input for filtering plugins */}
            <ToolbarItem>
              <TextInput
                id="search-plugins"
                placeholder="Search plugins"
                value={searchTerm}
                onChange={(_e, val) => setSearchTerm(val)}
              />
            </ToolbarItem>
            {/* Install all button - conditionally shown */}
            {showInstallAll && (
              <ToolbarItem>
                <Button
                  variant="secondary"
                  onClick={installAllPlugins}
                  isDisabled={!allPlugins.length}
                  isLoading={installation.isBulkInstalling}
                >
                  Install All
                </Button>
              </ToolbarItem>
            )}
            {/* Admin reconfiguration button - only for non-staff logged in users */}
            {!isStaff && isLoggedIn && (
              <ToolbarItem align={{ default: "alignRight" }}>
                <Button variant="link" onClick={resetCredentials}>
                  Reconfigure Admin
                </Button>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </Toolbar>

        {/*
         * Conditional content rendering based on loading state
         * Shows loading spinner, error message, or plugin grid
         */}
        {isLoading ? (
          <SpinContainer title="Fetching Plugins..." />
        ) : isError ? (
          <div>Error loading plugins.</div>
        ) : (
          <>
            {/*
             * Plugin grid with responsive layout
             * Each plugin is displayed in a card with installation controls
             */}
            <Grid hasGutter sm={12} lg={6} md={6} style={{ marginTop: "1rem" }}>
              {allPlugins.map((plugin) => (
                <GridItem key={plugin.id} span={6}>
                  <PluginCard
                    basePlugin={plugin}
                    computeList={computeList || []}
                    onInstall={handleInstall}
                    onModify={handleModify}
                    onResourcesChange={handleResourcesChange}
                    refreshMap={installation.refreshMap}
                  />
                </GridItem>
              ))}
            </Grid>
            {/* Intersection observer target for infinite scrolling */}
            <div ref={observerTarget} style={{ height: 1 }} />
            {/* Load more button shown when more pages are available */}
            {hasNextPage && (
              <Button
                variant="primary"
                onClick={() => fetchNextPage()}
                isDisabled={isFetchingNextPage}
                style={{ marginTop: "1rem" }}
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </Button>
            )}
          </>
        )}
      </Wrapper>

      {/*
       * Authentication modal for plugin operations
       * Shown when credentials are needed for installation/modification
       */}
      <StoreConfigModal
        isOpen={authentication.modalOpen}
        onClose={authentication.closeModal}
        onConfirm={authentication.handleModalConfirm}
        modalError={authentication.modalError}
      />
    </>
  );
};

export default Store;
