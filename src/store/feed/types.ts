/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from "keymirror";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";

// Description state for main user items[] and item
export interface IFeedState {
  feed?: Feed;
  feeds?: Feed["data"][];
  feedsCount?: number;
  pluginInstances?: PluginInstance[];
  selected?: PluginInstance;
}

export const FeedActionTypes = keyMirror({
  GET_ALL_FEEDS: null,
  GET_ALL_FEEDS_SUCCESS: null,
  GET_FEED_REQUEST: null,
  GET_FEED_SUCCESS: null,
  GET_PLUGIN_INSTANCES_REQUEST: null,
  GET_PLUGIN_INSTANCES_SUCCESS: null,
  RESET_FEED_STATE: null,
  ADD_FEED: null,
  GET_SELECTED_PLUGIN: null,
  ADD_NODE: null,
  ADD_NODE_SUCCESS: null,
});
