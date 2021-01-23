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
  const title = plugin.data.plugin_name;
  const formattedTitle = title.replace(/\s+/, "_");
  const plugin_version = plugin.data?.plugin_version;
  const id = plugin.data.id;
  return `${formattedTitle}_v${plugin_version}_${id}`;
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance) {
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`;
}

export function displayDescription(label: any) {
  if (label.error) {
    return "Error in compute";
  } else if (label.status === "pushing" && label.previous === "none") {
    return "Transmitting data to compute environment";
  } else if (
    label.previous === "pushPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "Setting compute environment";
  } else if (
    label.previous === "computeSubmit" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "Computing";
  } else if (
    label.previous === "computeReturn" &&
    label.previousComplete === true &&
    (label.status !== true || label.status === "pushing")
  ) {
    return "Syncing data from compute environment";
  } else if (
    label.previous === "pullPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "Finishing up";
  }
}
