/*
 *  File:            plugin/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin calls
 *  Author:          ChRIS UI
 *  Notes:           .
 */
import keyMirror from "keymirror";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { IFeedFile } from "../../api/models/feed-file.model";

export interface IPluginState {
  selected?: IPluginItem;
  descendants?: IPluginItem[];
  files?: IFeedFile[];
  parameters?: any[];
  status: String;
}

export const PluginActionTypes = keyMirror({
  GET_PLUGIN_DESCENDANTS: null,
  GET_PLUGIN_DESCENDANTS_SUCCESS: null,
  GET_PLUGIN_FILES: null,
  GET_PLUGIN_FILES_SUCCESS: null,
  GET_PLUGIN_PARAMETERS: null,
  GET_PLUGIN_PARAMETERS_SUCCESS: null,
  GET_PLUGIN_DETAILS: null,
  GET_PLUGIN_DETAILS_SUCCESS: null,
  RESET_PLUGIN_STATE: null,
  GET_PLUGIN_STATUS: null
});
