/*
*  File:            plugin/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS ui Demo
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IFeedItem } from "../../api/models/feed.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";


// Description state for main user items[] and item
export interface IPluginState {
    selected?: IPluginItem;
    descendants?: IPluginItem[];
    files?: any;
    parameters?: any;
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
    FETCH_COMPLETE: null, // after request completes
    FETCH_ERROR: null, // request failed
});
