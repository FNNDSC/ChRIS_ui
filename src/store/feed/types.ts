/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS ui Demo
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IFeedItem } from "../../api/models/feed.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";


// Description state for main user items[] and item
export interface IFeedState {
    details?: IFeedItem;
    items?: IPluginItem[];
    selected?: IPluginItem;
}

export const FeedActionTypes = keyMirror({
    GET_FEED_LIST: null,
    GET_FEED_DETAILS: null,
    GET_FEED_DETAILS_SUCCESS: null,
    GET_PLUGIN_INSTANCES: null,
    GET_PLUGIN_INSTANCES_SUCCESS: null,
    SET_SELECTED_PLUGIN: null,
    FETCH_COMPLETE: null, // after request completes
    FETCH_ERROR: null, // request failed
    FETCH_REQUEST: null, // before request
    FETCH_SUCCESS: null, // request is successful
});
