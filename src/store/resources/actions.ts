import { action } from 'typesafe-actions'
import {
  ResourceTypes,
  PluginInstanceObj,
  DestroyActiveResources,
} from './types'
import { PluginInstance } from '@fnndsc/chrisapi'

export const getPluginInstanceResources = (pluginInstances: PluginInstance[]) =>
  action(ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_REQUEST, pluginInstances)
export const getPluginInstanceResourceSuccess = (resource: any) =>
  action(ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS, resource)
export const stopFetchingPluginResources = (id: number) =>
  action(ResourceTypes.STOP_FETCHING_PLUGIN_RESOURCES, id)

export const getPluginInstanceStatusRequest = (items: PluginInstanceObj) =>
  action(ResourceTypes.GET_PLUGIN_STATUS_REQUEST, items)
export const getPluginInstanceStatusSuccess = (statusPayload: {
  selected: PluginInstance
  status: string
}) => action(ResourceTypes.GET_PLUGIN_STATUS_SUCCESS, statusPayload)
export const stopFetchingStatusResources = (id: number) =>
  action(ResourceTypes.STOP_FETCHING_STATUS_RESOURCES, id)

export const getPluginFilesRequest = (selected: PluginInstance) =>
  action(ResourceTypes.GET_PLUGIN_FILES_REQUEST, selected)
export const getPluginFilesSuccess = (filesPayload: {
  id: number
  files: any[]
  folders: any[]
}) => action(ResourceTypes.GET_PLUGIN_FILES_SUCCESS, filesPayload)
export const getPluginFilesError = (payload: { id: number; error: any }) =>
  action(ResourceTypes.GET_PLUGIN_FILES_ERROR, payload)

export const resetActiveResources = (data: DestroyActiveResources) =>
  action(ResourceTypes.RESET_ACTIVE_RESOURCES, data)

export const setCurrentUrl = (url: string) =>
  action(ResourceTypes.SET_CURRENT_URL, url)
