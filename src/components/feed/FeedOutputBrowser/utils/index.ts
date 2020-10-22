/**
 * Utils to be abstracted out
 */
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import { PluginStatusLabels } from "../types";
import UITreeNodeModel from "../../../../api/models/file-explorer.model";import { PluginStatus } from "../../../../store/plugin/types";
;

export function createTreeFromFiles(
  selected: PluginInstance,
  files?: FeedFile[]
) {
  if (!files) return null;

  const model = new UITreeNodeModel(files, selected);
  const tree = model.getTree();
  tree.module = getPluginName(selected);
  return tree;
}

// Format plugin name to "Name_vVersion_ID"
export function getPluginName(plugin: PluginInstance) {
  const title = plugin.data.plugin_name;
  const formattedTitle = title.replace(/\s+/, "_");
  const { plugin_version, id } = plugin.data;
  return `${formattedTitle}_v${plugin_version}_${id}`;
}

// Format plugin name to "Name v. Version"
export function getPluginDisplayName(plugin: PluginInstance){
  return `${plugin.data.plugin_name} v. ${plugin.data.plugin_version}`;
}

export function getStatusLabels(labels: PluginStatusLabels): PluginStatus[]  {
  let label = [];
 
  const isError=labels.compute.return.l_status[0]==='finishedWithError' 
  const isComputeSuccessful=isError ? false : true
  
  label[0] = {
    step: "pushPath",
    status: labels.pushPath.status,
    id: 1,
    previous: "none",
    title: "Transmit Data",
    previousComplete:true,
    error:false,
  };

  label[1] = {
    step: "computeSubmit",
    id: 2,
    status: labels.compute.submit.status,
    title: "Setup Compute Environment",
    previous: "pushPath",
    previousComplete: labels.pushPath.status === true,
    error:false
  };

  label[2] = {
    step: "computeReturn",
    id: 3,
    status:
      labels.compute.return.status && labels.compute.status && isComputeSuccessful ,
    title: "Compute",
    previous: "computeSubmit",
    previousComplete: labels.compute.submit.status,
    error: isError
  };

  label[3] = {
    step: "pullPath",
    id: 4,
    status: labels.pullPath.status,
    title: "Sync Data",
    previous: "computeReturn",
    previousComplete:
      labels.compute.return.status === true && labels.compute.status === true && isComputeSuccessful,
    error:isError
  };
  label[4] = {
    id: 5,
    step: "swiftPut",
    status: labels.swiftPut.status,
    title: "Finish Up",
    previous: "pullPath",
    previousComplete: labels.pullPath.status === true,
    error:isError
  };

  return label;
}

export function displayDescription(label: any) {
  if (label.status === "pushing" && label.previous === "none") {
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


