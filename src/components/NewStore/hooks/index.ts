/**
 * @file index.ts
 * @author ChRIS UI Team
 * @description Exports all custom hooks for the Store component
 */

export { useStoreAuthentication } from "./useStoreAuthentication";
export { usePluginInstallation } from "./usePluginInstallation";
export { usePluginSelection } from "./usePluginSelection";

// Also export types from the hooks for convenience
export type { PendingOperation } from "./useStoreAuthentication";
export type { RefreshMap } from "./usePluginInstallation";
export type { PluginResourceSelections } from "./usePluginSelection";
