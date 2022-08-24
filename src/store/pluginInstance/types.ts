/*
 *  File:            pluginInstance/types.ts
 *  Description:     Holds types and constants for managing Chris API plugin Instance calls
 *  Author:          ChRIS UI
 *
 */

import keyMirror from 'keymirror'
import { PluginInstance } from '@fnndsc/chrisapi'

export interface PluginInstanceObj {
  selected: PluginInstance
  pluginInstances: PluginInstance[]
}

export interface PluginInstancePayload {
  data?: PluginInstance[]
  error: any
  loading: boolean
}

export interface AddNodePayload {
  pluginItem: PluginInstance
  nodes?: PluginInstance[]
}

export interface SplitNodesPayload {
  splitNodes: PluginInstance[]
  nodes?: PluginInstance[]
  selectedPlugin?: PluginInstance
}

export interface IPluginInstanceState {
  pluginInstances: PluginInstancePayload
  selectedPlugin?: PluginInstance
  deleteNode: {
    error: string
    success: boolean
  }
}

export const PluginInstanceTypes = keyMirror({
  GET_SELECTED_PLUGIN: null,
  GET_PLUGIN_INSTANCES_REQUEST: null,
  GET_PLUGIN_INSTANCES_SUCCESS: null,
  GET_PLUGIN_INSTANCES_ERROR: null,
  ADD_NODE_REQUEST: null,
  ADD_NODE_SUCCESS: null,
  DELETE_NODE: null,
  DELETE_NODE_SUCCESS: null,
  DELETE_NODE_ERROR: null,
  CLEAR_DELETE: null,
  SET_PLUGIN_TITLE: null,
  SWITCH_TREE_MODE: null,
  ADD_TS_NODE: null,
  DELETE_TS_NODE: null,
  ADD_SPLIT_NODES: null,
  ADD_SPLIT_NODES_SUCCESS: null,
  RESET_PLUGIN_INSTANCES: null,
})
