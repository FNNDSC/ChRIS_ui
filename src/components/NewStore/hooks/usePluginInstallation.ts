/**
 * @file usePluginInstallation.ts
 * @author ChRIS UI Team
 * @description Custom hook for managing plugin installation operations
 */

import { useState, useCallback } from "react";
import { notification } from "antd";
import type { Plugin } from "@fnndsc/chrisapi";
import type { ComputeResource } from "@fnndsc/chrisapi";
import type { StorePlugin } from "./useFetchPlugins";
import { handleInstallPlugin } from "../../PipelinesCopy/utils";
import postModifyComputeResource from "./updateComputeResource";

/**
 * @interface RefreshMap
 * @description Maps plugin IDs to refresh counters for triggering UI updates
 */
export interface RefreshMap {
  [pluginId: string]: number;
}

/**
 * @interface PluginInstallationState
 * @description State and functions returned by the usePluginInstallation hook
 */
interface PluginInstallationState {
  /** Maps plugin IDs to refresh counters */
  refreshMap: RefreshMap;
  /** Whether a bulk installation is in progress */
  isBulkInstalling: boolean;
  /** Handle installation of a single plugin */
  handleInstall: (
    plugin: StorePlugin,
    resources: ComputeResource[],
    authHeader: string,
  ) => Promise<void>;
  /** Handle modification of compute resources for an existing plugin */
  handleModify: (
    plugin: Plugin,
    resources: ComputeResource[],
    authHeader: string,
  ) => Promise<void>;
  /** Install all plugins in the current view */
  installAllPlugins: (
    plugins: StorePlugin[],
    getResourcesForPlugin: (id: string) => ComputeResource[],
    getAuthHeader: (
      plugin: StorePlugin,
      resources: ComputeResource[],
    ) => string | null,
  ) => Promise<void>;
  /** Update the refresh counter for a plugin */
  updatePluginRefreshCounter: (pluginId: string) => void;
}

/**
 * Custom hook for managing plugin installation operations
 *
 * @returns {PluginInstallationState} Plugin installation state and functions
 */
export const usePluginInstallation = (): PluginInstallationState => {
  // Track refresh state for each plugin
  const [refreshMap, setRefreshMap] = useState<RefreshMap>({});

  // Track bulk installation state
  const [isBulkInstalling, setBulkInstalling] = useState(false);

  /**
   * Update the refresh counter for a plugin
   * Used to trigger UI updates for a specific plugin
   *
   * @param {string} pluginId - ID of the plugin to refresh
   */
  const updatePluginRefreshCounter = useCallback((pluginId: string) => {
    setRefreshMap((prev) => ({
      ...prev,
      [pluginId]: (prev[pluginId] || 0) + 1,
    }));
  }, []);

  /**
   * Handle installation of a single plugin
   *
   * This function:
   * 1. Calls the plugin installation utility
   * 2. Shows success/error notifications
   * 3. Updates the refresh counter for the plugin
   *
   * @param {StorePlugin} plugin - Plugin to install
   * @param {ComputeResource[]} resources - Compute resources for the plugin
   * @param {string} authHeader - Authentication header
   * @returns {Promise<void>}
   */
  const handleInstall = useCallback(
    async (
      plugin: StorePlugin,
      resources: ComputeResource[],
      authHeader: string,
    ) => {
      try {
        // Important: Include plugin_store_url directly as the API requires it
        const pluginAdapter = {
          name: plugin.name,
          version: plugin.version,
          // Provide plugin_store_url directly instead of relying on url mapping
          url: plugin.url,
        };

        // Fixed parameter order to match handleInstallPlugin function definition
        await handleInstallPlugin(authHeader, pluginAdapter, resources);

        notification.success({
          message: "Success",
          description: `Installed plugin ${plugin.title} to ${plugin.url || ""}`,
          placement: "bottomRight",
        });
        updatePluginRefreshCounter(plugin.id);
      } catch (err: any) {
        console.error(err);
        notification.error({
          message: "Installation failed",
          description: err?.message || "Installation failed",
          placement: "bottomRight",
        });
      }
    },
    [updatePluginRefreshCounter],
  );

  /**
   * Handle modification of compute resources for an existing plugin
   *
   * This function:
   * 1. Makes API call to update compute resources
   * 2. Shows success/error notifications
   * 3. Updates the refresh counter for the plugin
   *
   * @param {Plugin} plugin - Plugin to modify
   * @param {ComputeResource[]} resources - New compute resources
   * @param {string} authHeader - Authentication header
   * @returns {Promise<void>}
   */
  const handleModify = useCallback(
    async (
      plugin: Plugin,
      resources: ComputeResource[],
      authHeader: string,
    ) => {
      try {
        await postModifyComputeResource(
          plugin.data.name,
          plugin.data.version,
          resources.map((r) => r.data.name),
          authHeader,
          plugin.collection.items[0].href,
        );
        notification.success({
          message: "Success",
          description: `Updated compute resources for plugin ${plugin.data.name}.`,
          placement: "bottomRight",
        });
        updatePluginRefreshCounter(plugin.data.id);
      } catch (err) {
        console.error(err);
        notification.error({
          message: "Error",
          description: `Failed to update compute resources for ${plugin.data.name}.`,
          placement: "bottomRight",
        });
      }
    },
    [updatePluginRefreshCounter],
  );

  /**
   * Install all plugins in the current view
   *
   * This function:
   * 1. Sets bulk installation state to true
   * 2. Maps through all plugins and installs each one
   * 3. Uses selected compute resources if available
   * 4. Sets bulk installation state back to false when complete
   *
   * @param {StorePlugin[]} plugins - Plugins to install
   * @param {Function} getResourcesForPlugin - Function to get compute resources for a plugin
   * @param {Function} getAuthHeader - Function to get auth header for a plugin
   * @returns {Promise<void>}
   */
  const installAllPlugins = useCallback(
    async (
      plugins: StorePlugin[],
      getResourcesForPlugin: (id: string) => ComputeResource[],
      getAuthHeader: (
        plugin: StorePlugin,
        resources: ComputeResource[],
      ) => string | null,
    ) => {
      setBulkInstalling(true);

      const installs = plugins.map(async (plugin) => {
        try {
          // Get compute resources for this plugin
          const resources = getResourcesForPlugin(plugin.id);

          // Get auth header for this plugin
          const hdr = getAuthHeader(plugin, resources);
          if (!hdr) return;

          // Important: Include plugin_store_url directly as the API requires it
          const pluginAdapter = {
            name: plugin.name,
            version: plugin.version,
            // Provide plugin_store_url directly instead of relying on url mapping
            plugin_store_url: plugin.url,
          };

          // Install the plugin with fixed parameter order
          await handleInstallPlugin(hdr, pluginAdapter, resources);
          updatePluginRefreshCounter(plugin.id);

          // Show success notification
          notification.success({
            message: "Success",
            description: `Installed plugin ${plugin.title}.`,
            placement: "bottomRight",
          });
        } catch (err: any) {
          console.error(err);
          notification.error({
            message: "Installation failed",
            description: `Failed to install ${plugin.title}: ${err?.message || ""}`,
            placement: "bottomRight",
          });
        }
      });

      await Promise.all(installs);
      setBulkInstalling(false);
    },
    [updatePluginRefreshCounter],
  );

  return {
    refreshMap,
    isBulkInstalling,
    handleInstall,
    handleModify,
    installAllPlugins,
    updatePluginRefreshCounter,
  };
};
