/**
 * @file usePluginSelection.ts
 * @author ChRIS UI Team
 * @description Custom hook for managing plugin compute resource selection
 */

import { useRef, useCallback } from "react";
import type { ComputeResource } from "@fnndsc/chrisapi";

/**
 * @interface PluginResourceSelections
 * @description Tracks compute resource selections per plugin
 */
export interface PluginResourceSelections {
  [pluginId: string]: ComputeResource[];
}

/**
 * @interface PluginVersionSelections
 * @description Tracks selected version for each plugin
 */
export interface PluginVersionSelections {
  [pluginId: string]: { pluginId: string; version: string };
}

/**
 * @interface SelectionState
 * @description State and functions returned by the usePluginSelection hook
 */
interface SelectionState {
  /** Handle compute resource selection changes for a plugin */
  handleResourcesChange: (
    pluginId: string,
    resources: ComputeResource[],
  ) => void;
  /** Get selected compute resources for a plugin */
  getResourcesForPlugin: (
    pluginId: string,
    defaultResource?: ComputeResource | null,
  ) => ComputeResource[];
  /** Handle version selection changes for a plugin */
  handleVersionChange: (
    pluginId: string,
    selectedPluginId: string,
    version: string,
  ) => void;
  /** Get selected version for a plugin */
  getSelectedVersion: (pluginId: string) =>
    | {
        pluginId: string;
        version: string;
      }
    | undefined;
}

/**
 * Custom hook for managing plugin compute resource selection
 *
 * @returns {SelectionState} Selection state and functions
 */
export const usePluginSelection = (): SelectionState => {
  // Track compute resource selections for each plugin
  const selectionMapRef = useRef<PluginResourceSelections>({});

  // Track version selections for each plugin
  const versionSelectionMapRef = useRef<PluginVersionSelections>({});

  /**
   * Handle compute resource selection changes for a plugin
   *
   * @param {string} pluginId - Plugin identifier
   * @param {ComputeResource[]} resources - Selected compute resources
   */
  const handleResourcesChange = useCallback(
    (pluginId: string, resources: ComputeResource[]) => {
      selectionMapRef.current = {
        ...selectionMapRef.current,
        [pluginId]: resources,
      };
    },
    [],
  );

  /**
   * Get selected compute resources for a plugin
   *
   * @param {string} pluginId - Plugin identifier
   * @param {ComputeResource|null} [defaultResource=null] - Default compute resource to use if none selected
   * @returns {ComputeResource[]} Selected compute resources for the plugin
   */
  const getResourcesForPlugin = useCallback(
    (
      pluginId: string,
      defaultResource: ComputeResource | null = null,
    ): ComputeResource[] => {
      if (selectionMapRef.current[pluginId]) {
        return selectionMapRef.current[pluginId];
      }
      return defaultResource ? [defaultResource] : [];
    },
    [],
  );

  /**
   * Handle version selection changes for a plugin
   *
   * @param {string} pluginId - Parent plugin identifier (the one with multiple versions)
   * @param {string} selectedPluginId - ID of the selected plugin version
   * @param {string} version - Version string of the selected plugin
   */
  const handleVersionChange = useCallback(
    (pluginId: string, selectedPluginId: string, version: string) => {
      versionSelectionMapRef.current = {
        ...versionSelectionMapRef.current,
        [pluginId]: { pluginId: selectedPluginId, version },
      };
    },
    [],
  );

  /**
   * Get selected version for a plugin
   *
   * @param {string} pluginId - Plugin identifier
   * @returns {Object|undefined} Selected version info or undefined if none selected
   */
  const getSelectedVersion = useCallback((pluginId: string) => {
    return versionSelectionMapRef.current[pluginId];
  }, []);

  return {
    handleResourcesChange,
    getResourcesForPlugin,
    handleVersionChange,
    getSelectedVersion,
  };
};
