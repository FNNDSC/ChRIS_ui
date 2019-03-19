import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import {IFeedFile} from "../../api/models/feed-file.model";
import UITreeNodeModel from "../../api/models/file-explorer";


export const getPluginDescendantsRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS, url);
export const getPluginDescendantsSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS, items);

export const getPluginFilesRequest = (selected: IPluginItem) =>  action(PluginActionTypes.GET_PLUGIN_FILES, selected);
export const getPluginFilesSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_FILES_SUCCESS, items);
// Description: Parse the files array into a File tree obj
export const setExplorerSuccess = (items: IFeedFile[], selected: IPluginItem) => action(PluginActionTypes.SET_EXPLORER_SUCCESS, new UITreeNodeModel(items, selected).getTree());


export const getPluginParametersRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_PARAMETERS, url);
export const getPluginParametersSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS, items);

export const getPluginDetailsRequest = (item: IPluginItem) => action(PluginActionTypes.GET_PLUGIN_DETAILS, item);
export const getPluginDetailsSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS, items);
