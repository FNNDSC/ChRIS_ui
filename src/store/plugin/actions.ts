
import { action } from "typesafe-actions";
import { PluginActionTypes } from "./types";
import { IPluginItem } from "../../api/models/pluginInstance.model";


export const getPluginDescendantsRequest = (url: string) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS, url);
export const getPluginDescendantsSuccess = (items: IPluginItem[]) => action(PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS, items);
