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
 * @interface SelectionState
 * @description State and functions returned by the usePluginSelection hook
 */
interface SelectionState {
  /** Function to handle compute resource selection changes for a plugin */
  handleResourcesChange: (
    pluginId: string,
    resources: ComputeResource[],
  ) => void;
  /** Function to get selected compute resources for a plugin */
  getResourcesForPlugin: (
    pluginId: string,
    defaultResource?: ComputeResource | null,
  ) => ComputeResource[];
}

/**
 * Custom hook for managing plugin compute resource selection
 *
 * @returns {SelectionState} Selection state and functions
 */
export const usePluginSelection = (): SelectionState => {
  // Track compute resource selections for each plugin
  const selectionMapRef = useRef<PluginResourceSelections>({});

  /**
   * Handle compute resource selection changes for a plugin
   *
   * @param {string} pluginId - Plugin identifier
   * @param {ComputeResource[]} resources - Selected compute resources
   */
  const handleResourcesChange = useCallback(
    (pluginId: string, resources: ComputeResource[]) => {
      selectionMapRef.current[pluginId] = resources;
    },
    [],
  );

  /**
   * Get selected compute resources for a plugin
   *
   * Returns the selected compute resources for a plugin if available,
   * otherwise returns an array containing the default resource if provided.
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

  return {
    handleResourcesChange,
    getResourcesForPlugin,
  };
};
