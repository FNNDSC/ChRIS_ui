/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from "keymirror";
import { UploadedFile, Feed, PluginInstance } from "@fnndsc/chrisapi";

// Description state for main user items[] and item
export interface IFeedState {
  feed?: Feed;
  feeds?: Feed["data"][];
  feedsCount?: number;
  items?: PluginInstance[];
  uploadedFiles?: UploadedFile[];
}

export const FeedActionTypes = keyMirror({
  GET_ALL_FEEDS: null,
  GET_ALL_FEEDS_SUCCESS: null,
  GET_FEED: null,
  GET_FEED_SUCCESS: null,
  GET_PLUGIN_INSTANCES: null,
  GET_PLUGIN_INSTANCES_SUCCESS: null,
  GET_UPLOADED_FILES: null,
  GET_UPLOADED_FILES_SUCCESS: null,
  RESET_STATE: null,
  ADD_FEED: null,
  ADD_NODE: null,
});
