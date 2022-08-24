import { action } from 'typesafe-actions'
import {
  PluginInstanceTypes,
  PluginInstanceObj,
  AddNodePayload,
  SplitNodesPayload,
} from './types'
import { PluginInstance, Feed } from '@fnndsc/chrisapi'
export const getSelectedPlugin = (item: PluginInstance) =>
  action(PluginInstanceTypes.GET_SELECTED_PLUGIN, item)

export const getPluginInstancesRequest = (feed: Feed) =>
  action(PluginInstanceTypes.GET_PLUGIN_INSTANCES_REQUEST, feed)
export const getPluginInstancesSuccess = (items: PluginInstanceObj) =>
  action(PluginInstanceTypes.GET_PLUGIN_INSTANCES_SUCCESS, items)
export const getPluginInstancesError = (error: any) =>
  action(PluginInstanceTypes.GET_PLUGIN_INSTANCES_ERROR, error)
export const addNodeRequest = (item: AddNodePayload) =>
  action(PluginInstanceTypes.ADD_NODE_REQUEST, item)
export const addNodeSuccess = (pluginItem: PluginInstance) =>
  action(PluginInstanceTypes.ADD_NODE_SUCCESS, pluginItem)

export const setPluginTitle = (pluginItem: PluginInstance) =>
  action(PluginInstanceTypes.SET_PLUGIN_TITLE, pluginItem)

export const deleteNode = (instance: PluginInstance) => {
  return action(PluginInstanceTypes.DELETE_NODE, instance)
}
export const deleteNodeSuccess = (id: number) =>
  action(PluginInstanceTypes.DELETE_NODE_SUCCESS, id)

export const deleteNodeError = (error: string) =>
  action(PluginInstanceTypes.DELETE_NODE_ERROR, error)

export const addSplitNodes = (splitNodesPayload: SplitNodesPayload) =>
  action(PluginInstanceTypes.ADD_SPLIT_NODES, splitNodesPayload)
export const addSplitNodesSuccess = (splitNodes: PluginInstance[]) =>
  action(PluginInstanceTypes.ADD_SPLIT_NODES_SUCCESS, splitNodes)

export const resetPluginInstances = () =>
  action(PluginInstanceTypes.RESET_PLUGIN_INSTANCES)

export const clearDeleteState = () => action(PluginInstanceTypes.CLEAR_DELETE)
