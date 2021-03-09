/**
 * Utils to be abstracted out
 */
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import UITreeNodeModel from "../../../../api/models/file-explorer.model";

export function createTreeFromFiles(
  selected?: PluginInstance,
  files?: FeedFile[]
) {
  if (!files || !selected) return null;
  const model = new UITreeNodeModel(files, selected);
  
  const tree = model.getTree();
  tree.module = getPluginName(selected);
  return tree;
}

// Format plugin name to "Name_vVersion_ID"
export function getPluginName(plugin: PluginInstance) {
  const title = plugin.data.title || plugin.data.plugin_name;
  return title;
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance) {
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`;
}


