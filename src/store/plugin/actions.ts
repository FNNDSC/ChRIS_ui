import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import { FeedFile } from "@fnndsc/chrisapi";

export const getPluginDescendantsRequest = (url: string) =>
  action(PluginActionTypes.GET_PLUGIN_DESCENDANTS, url);
export const getPluginDescendantsSuccess = (items: IPluginItem[]) =>
  action(PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS, items);

export const getPluginFiles = (selected: IPluginItem) =>
  action(PluginActionTypes.GET_PLUGIN_FILES, selected);
export const getPluginFilesSuccess = (items: IPluginItem[]) =>
  action(PluginActionTypes.GET_PLUGIN_FILES_SUCCESS, items);

export const getPluginParametersRequest = (url: string) =>
  action(PluginActionTypes.GET_PLUGIN_PARAMETERS, url);
export const getPluginParametersSuccess = (items: IPluginItem[]) =>
  action(PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS, items);

export const getPluginDetailsRequest = (item: IPluginItem) =>
  action(PluginActionTypes.GET_PLUGIN_DETAILS, item);
export const getPluginDetailsSuccess = (items: IPluginItem[]) =>
  action(PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS, items);

export const destroyPlugin = () => action(PluginActionTypes.RESET_PLUGIN_STATE);

export const getPluginStatus = (pluginStatus: String) =>
  action(PluginActionTypes.GET_PLUGIN_STATUS, pluginStatus);

export const addFiles = (files: FeedFile[]) =>
  action(PluginActionTypes.ADD_FILES, files);
