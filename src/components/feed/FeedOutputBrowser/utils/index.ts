/**
 * Utils to be abstracted out
 */
import { PluginInstance } from "@fnndsc/chrisapi";

// Format plugin name to "Name_vVersion_ID"
export function getPluginName(plugin: PluginInstance) {
  const title = plugin.data.plugin_name;
  const formattedTitle = title.replace(/\s+/, "_");
  const { plugin_version, id } = plugin.data;
  return `${formattedTitle}_v${plugin_version}_${id}`;
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance) {
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`;
}

