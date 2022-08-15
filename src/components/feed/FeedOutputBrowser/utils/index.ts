/**
 * Utils to be abstracted out
 */
import { PluginInstance, FeedFile } from '@fnndsc/chrisapi'
import { each, find } from 'lodash'
import { DataNode } from '../../../../store/explorer/types'



export function bytesToSize(bytes: number) {
  const sizes: string[] = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'N/A'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / Math.pow(1024, i)).toFixed(0)} ${sizes[i]}`
}

// Format plugin name to "Name_vVersion_ID"
export function getPluginName(plugin: PluginInstance) {
  const title = plugin.data.title || plugin.data.plugin_name
  return title
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance) {
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`
}

