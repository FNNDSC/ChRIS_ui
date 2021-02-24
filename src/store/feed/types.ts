/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from "keymirror";
import { Feed, FeedFile, PluginInstance } from "@fnndsc/chrisapi";


export interface NodeDetailsProps {
  selected?: PluginInstance;
  pluginInstanceResource?: ResourcePayload;
  text?: string;
}


export interface PluginInstanceObj {
  selected: PluginInstance;
  pluginInstances: PluginInstance[];
}

export interface AddNodePayload {
  pluginItem: PluginInstance;
  nodes?: PluginInstance[];
}

export interface PluginStatus {
  id: number;
  title: string;
  status: boolean;
  isCurrentStep: boolean;
  error: boolean;
  icon: any;
}
type Return = {
  l_logs: any[];
  l_status: string[];
  status: boolean;
};

type Submit = {
  status: boolean;
};

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    return: Return;
    status: boolean;
    submit: Submit;
  };
  swiftPut: { [key: string]: boolean };
  pullPath: { [key: string]: boolean };
}

export interface Logs {
  [key: string]: {
    logs: string;
  };
}

export interface ResourcePayload {
  pluginStatus?: PluginStatus[];
  pluginLog?: Logs;
}

export interface PluginInstanceResourcePayload {
  [id: string]: ResourcePayload;
}

export interface FilesPayload {
  [id: string]: {
    files: FeedFile[];
    error: any;
    hasNext: boolean;
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

export interface PluginInstanceStatusPayload {
  [id: string]: {
    status: string;
  };
}

export interface FeedTreeProp {
  orientation: "horizontal" | "vertical";
  translate: {
    x: number;
    y: number;
  };
}


export interface DestroyData {
  data?: PluginInstance[];
  selectedPlugin?: PluginInstance;
}


// Description state for main user items[] and item
export interface IFeedState {
  allFeeds: {
    data?: Feed[];
    error: any;
    loading: boolean;
    totalFeedsCount: 0;
  };
  currentFeed: FeedPayload;
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
  loadingAddNode: boolean;
  pluginInstanceStatus: PluginInstanceStatusPayload;
  pluginInstanceResource: PluginInstanceResourcePayload;
  pluginFiles: FilesPayload;
  feedTreeProp: FeedTreeProp;
  currentLayout: boolean;
  deleteNodeSuccess: boolean;
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
  RESET_PLUGIN_STATE: null,
  GET_FEED_TREE_PROP: null,
  SET_LAYOUT: null,
  GET_PLUGIN_STATUS_REQUEST: null,
  GET_PLUGIN_STATUS_SUCCESS: null,
  STOP_FETCHING_STATUS_RESOURCES: null,
});
