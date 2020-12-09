/*
 *  File:            plugin/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin calls
 *  Author:          ChRIS UI
 *  Notes:           .
 */
import keyMirror from "keymirror";
import { PluginParameter } from "@fnndsc/chrisapi";


export interface PluginStatus {
  step: string;
  status: boolean;
  id: number;
  previous: string;
  title: string;
  previousComplete: boolean;
}

export interface IPluginState {
  parameters?: PluginParameter[];
  computeEnv?: any[];
  pluginFiles?: {};
  pluginStatus?: PluginStatus[];
  pluginLog?: {};
  computeError?: boolean;
}

export const PluginActionTypes = keyMirror({
  GET_PLUGIN_DESCENDANTS: null,
  GET_PLUGIN_DESCENDANTS_SUCCESS: null,
  GET_PLUGIN_FILES_REQUEST: null,
  GET_PLUGIN_FILES_SUCCESS: null,
  GET_PLUGIN_FILES_ERROR: null,
  GET_PLUGIN_PARAMETERS: null,
  GET_PLUGIN_PARAMETERS_SUCCESS: null,
  GET_PLUGIN_DETAILS_REQUEST: null,
  GET_PLUGIN_DETAILS_SUCCESS: null,
  RESET_PLUGIN_STATE: null,
  GET_PLUGIN_STATUS: null,
  GET_PLUGIN_LOG: null,
  GET_PARAMS: null,
  GET_PARAMS_SUCCESS: null,
  GET_COMPUTE_ERROR_SUCCESS: null,
  STOP_POLLING: null,
  GET_COMPUTE_ENV: null,
  GET_COMPUTE_ENV_SUCCESS: null,
  GET_PLUGIN_RESOURCES: null,
});
