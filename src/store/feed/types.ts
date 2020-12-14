/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from "keymirror";
import { Feed, FeedFile, PluginInstance } from "@fnndsc/chrisapi";

export interface PluginStatus {
  step: string;
  status: boolean;
  id: number;
  previous: string;
  title: string;
  previousComplete: boolean;
}

export interface PluginInstanceResourcePayload {
  [id: string]: {
    pluginStatus?: PluginInstance[];
    pluginLog?: {};
  };
}

export interface FilesPayload {
  [id: string]: {
    files: FeedFile[];
    error: any;
  };
}

export interface FeedPayload { 
    data?: Feed;
    error: any;
    loading: boolean;
}

export interface PluginInstancePayload {
  data?: PluginInstance[];
  error: any;
  loading: boolean;
}


// Description state for main user items[] and item
export interface IFeedState {
  allFeeds: {
    data?: Feed["data"][];
    error: any;
    loading: boolean;
    totalFeedsCount: 0;
  };
  currentFeed: FeedPayload;
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  loadingAddNode: boolean;
  deleteNodeSuccess: boolean;
  pluginInstanceResource: PluginInstanceResourcePayload;
  pluginFiles: FilesPayload;
}

export const FeedActionTypes = keyMirror({
  GET_ALL_FEEDS_REQUEST: null,
  GET_ALL_FEEDS_ERROR: null,
  GET_ALL_FEEDS_SUCCESS: null,
  GET_FEED_REQUEST: null,
  GET_FEED_SUCCESS: null,
  GET_FEED_ERROR: null,
  GET_PLUGIN_INSTANCES_REQUEST: null,
  GET_PLUGIN_INSTANCES_SUCCESS: null,
  GET_PLUGIN_INSTANCES_ERROR: null,
  GET_PLUGIN_INSTANCE_RESOURCE_REQUEST: null,
  GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: null,
  GET_PLUGIN_FILES_REQUEST: null,
  GET_PLUGIN_FILES_SUCCESS: null,
  GET_PLUGIN_FILES_ERROR: null,
  RESET_FEED_STATE: null,
  ADD_FEED: null,
  GET_SELECTED_PLUGIN: null,
  ADD_NODE_REQUEST: null,
  ADD_NODE_SUCCESS: null,
  DELETE_NODE: null,
  DELETE_NODE_SUCCESS: null,
  STOP_FETCHING_PLUGIN_RESOURCES: null,
  POLLING_STATUS: null,
  GET_TEST_STATUS: null,
});
