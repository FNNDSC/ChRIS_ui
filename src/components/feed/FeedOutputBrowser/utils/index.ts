/**
 * Utils to be abstracted out
 */
import { PluginInstance } from "@fnndsc/chrisapi";
import { PluginStatusLabels } from "../types";

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

export function getStatusLabels(labels: PluginStatusLabels) {
  let label = [];

  label[0] = {
    step: "pushPath",
    status: labels.pushPath.status,
    id: 1,
    previous: "none",
    title: "Transmit Data",
  };

  label[1] = {
    step: "computeSubmit",
    id: 2,
    status: labels.compute.submit.status,
    title: "Setup Compute Environment",
    previous: "pushPath",
    previousComplete: labels.pushPath.status === true,
  };

  label[2] = {
    step: "computeReturn",
    id: 3,
    status: labels.compute.return.status,
    title: "Compute",
    previous: "computeSubmit",
    previousComplete: labels.compute.submit.status === true,
  };

  label[3] = {
    step: "pullPath",
    id: 4,
    status: labels.pullPath.status,
    title: "Sync Data",
    previous: "computeReturn",
    previousComplete: labels.compute.return.status === true,
  };
  label[4] = {
    id: 5,
    step: "swiftPut",
    status: labels.swiftPut.status,
    title: "Finish Up",
    previous: "pullPath",
    previousComplete: labels.pullPath.status === true,
  };

  return label;
}

export function displayDescription(label: any) {
  if (label.status === "pushing" && label.previous === "none") {
    return "transmitting data to compute environment";
  } else if (
    label.previous === "pushPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "setting compute environment";
  } else if (
    label.previous === "computeSubmit" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "computing";
  } else if (
    label.previous === "computeReturn" &&
    label.previousComplete === true &&
    (label.status !== true || label.status === "pushing")
  ) {
    return "syncing data from compute environment";
  } else if (
    label.previous === "pullPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "finishing up";
  }
}
