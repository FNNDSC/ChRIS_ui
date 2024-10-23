/*
 *  File:            pluginInstance/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin Instance calls
 *  Author:          ChRIS UI
 *
 */

import type { PluginInstance } from "@fnndsc/chrisapi";

export interface PluginInstanceObj {
  selected: PluginInstance;
  pluginInstances: PluginInstance[];
}

export interface PluginInstancePayload {
  data: PluginInstance[];
  error: string;
  loading: boolean;
}

export interface AddNodePayload {
  pluginItem: PluginInstance;
  nodes: PluginInstance[];
}

export interface SplitNodesPayload {
  splitNodes: PluginInstance[];
  nodes?: PluginInstance[];
  selectedPlugin?: PluginInstance;
}

export interface IPluginInstanceState {
  pluginInstances: PluginInstancePayload;
  selectedPlugin?: PluginInstance;
}
