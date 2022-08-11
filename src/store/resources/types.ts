/*
 *  File:            resources/types.ts
 *  Description:     Holds types and constants for managing polling plugin instances
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from 'keymirror'
import { PluginInstance, FeedFile } from '@fnndsc/chrisapi'

type Return = {
  status: boolean
  job_status: string
}

type Submit = {
  status: boolean
}

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean }
  compute: {
    return: Return
    status: boolean
    submit: Submit
  }
  swiftPut: { [key: string]: boolean }
  pullPath: { [key: string]: boolean }
}

export interface PluginInstanceStatusPayload {
  [id: string]: {
    status: string
  }
}

export interface PluginStatus {
  id: number
  title: string
  status: boolean
  isCurrentStep: boolean
  error: boolean
  icon: any
}

export interface Logs {
  [key: string]: {
    logs: string
  }
}

export interface ResourcePayload {
  pluginStatus?: PluginStatus[]
  pluginLog?: Logs
}

export interface FilesPayload {
  [id: string]: {
    files: FeedFile[]
    folders: string[]
    error: any
    path: string
  }
}

export interface PluginInstanceResourcePayload {
  [id: string]: ResourcePayload
}

export interface PluginInstanceObj {
  selected: PluginInstance
  pluginInstances: PluginInstance[]
}

export interface NodeDetailsProps {
  selected?: PluginInstance
  pluginInstanceResource?: ResourcePayload
  text?: string
}

export interface DestroyActiveResources {
  data?: PluginInstance[]
  selectedPlugin?: PluginInstance
}

export interface IResourceState {
  pluginInstanceStatus: PluginInstanceStatusPayload
  pluginInstanceResource: PluginInstanceResourcePayload
  pluginFiles: FilesPayload
  url: string
}

export const ResourceTypes = keyMirror({
  GET_PLUGIN_INSTANCE_RESOURCE_REQUEST: null,
  GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: null,
  GET_PLUGIN_STATUS_REQUEST: null,
  GET_PLUGIN_STATUS_SUCCESS: null,
  STOP_FETCHING_STATUS_RESOURCES: null,
  STOP_FETCHING_PLUGIN_RESOURCES: null,
  GET_PLUGIN_FILES_REQUEST: null,
  GET_PLUGIN_FILES_SUCCESS: null,
  GET_PLUGIN_FILES_ERROR: null,
  RESET_ACTIVE_RESOURCES: null,
  SET_CURRENT_URL: null,
})
