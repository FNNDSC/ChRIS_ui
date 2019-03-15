/*
*  File:            feed/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IFeedItem } from "../../api/models/feed.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";

// Description state for main user items[] and item
export interface IFeedState {
    details?: IFeedItem;
    feeds?: IFeedItem[];
    items?: IPluginItem[];
}

export const FeedActionTypes = keyMirror({
    GET_ALL_FEEDS: null,
    GET_ALL_FEEDS_SUCCESS: null,
    GET_FEED_DETAILS: null,
    GET_FEED_DETAILS_SUCCESS: null,
    GET_PLUGIN_INSTANCES: null,
    GET_PLUGIN_INSTANCES_SUCCESS: null,
    FETCH_COMPLETE: null, // after request completes
    FETCH_ERROR: null, // request failed
    FETCH_REQUEST: null, // before request
    FETCH_SUCCESS: null, // request is successful
    RESET_STATE: null
});
