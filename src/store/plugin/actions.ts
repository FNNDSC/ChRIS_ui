
import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";
import { IPluginItem } from "../../api/models/pluginInstance.model";


export const getPluginDescendantsRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS, url);
export const getPluginDescendantsSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS, items);

export const getPluginFilesRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_FILES, url);
export const getPluginFilesSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_FILES_SUCCESS, items);

export const getPluginParametersRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_PARAMETERS, url);
export const getPluginParametersSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS, items);

export const getPluginDetailsRequest = (item: IPluginItem) => action(PluginActionTypes.GET_PLUGIN_DETAILS, item);
export const getPluginDetailsSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS, items);

