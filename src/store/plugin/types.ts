/*
 *  File:            plugin/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin calls
 *  Author:          ChRIS UI
 *  Notes:           .
 */
import keyMirror from "keymirror";

import { PluginParameter } from "@fnndsc/chrisapi";

export interface IPluginState {
  parameters?: PluginParameter[];
  pluginFiles?: {};
  pluginStatus?: string;
  pluginLog?: {};
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
  STOP_POLLING: null,
});
