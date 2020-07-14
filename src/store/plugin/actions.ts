import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";

import { PluginParameter, Plugin, PluginInstance } from "@fnndsc/chrisapi";

export const getPluginFilesRequest = (selected: PluginInstance) =>
  action(PluginActionTypes.GET_PLUGIN_FILES_REQUEST, selected);
export const getPluginFilesSuccess = (items: PluginInstance[]) =>
  action(PluginActionTypes.GET_PLUGIN_FILES_SUCCESS, items);

export const destroyPluginState = () => {
  return action(PluginActionTypes.RESET_PLUGIN_STATE);
};

export const getPluginStatus = (pluginStatus: String) =>
  action(PluginActionTypes.GET_PLUGIN_STATUS, pluginStatus);

export const getParams = (plugin: Plugin) =>
  action(PluginActionTypes.GET_PARAMS, plugin);

export const getParamsSuccess = (params: PluginParameter[]) =>
  action(PluginActionTypes.GET_PARAMS_SUCCESS, params);

export const stopPolling = () => action(PluginActionTypes.STOP_POLLING);

export const getPluginLog = (pluginLog: {}) =>
  action(PluginActionTypes.GET_PLUGIN_LOG, pluginLog);
