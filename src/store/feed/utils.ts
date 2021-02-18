
import { PluginStatusLabels } from "./types";


export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any
) {
  const isError = false;
  const isComputeSuccessful = isError ? false : true;


  let status = [];

  let statusLabels = [
    "waiting",
    "scheduled",
    "started",
    "compute",
    "registeringFiles",
    "finishedSuccessfully",
    "finishedWithError",
    "cancelled",
  ];
  const pluginStatus = pluginDetails.data.status;
  const errorFound =
    pluginDetails.data.status === "finishedWithError" ||
    pluginDetails.data.status === "cancelled"
      ? true
      : false;
  const error = errorFound || !isComputeSuccessful ? true : false;

  status[0] = {
    id: 1,
    title: "Waiting",
    status: statusLabels.indexOf(pluginStatus) > 0 ? true : false,
    isCurrentStep: pluginDetails.data.status === "waiting",
    error,
  };

  status[1] = {
    id: 2,
    title: "Scheduled",
    status: statusLabels.indexOf(pluginStatus) > 1 ? true : false,
    isCurrentStep: pluginDetails.data.status === "scheduled" ? true : false,
    error,
  };

  status[2] = {
    id: 3,
    title: "Started",
    status: labels?.pushPath.status === true ? true : false,
    isCurrenStep:
      pluginDetails.data.status === "started" && labels.pushPath.status !== true
        ? true
        : false,
    error,
  };

  status[3] = {
    id: 4,
    title: "Compute",
    status:
      labels?.compute.return.status === true &&
      labels?.pullPath.status === true &&
      isComputeSuccessful &&
      statusLabels.indexOf(pluginStatus) > 3
        ? true
        : false,
    isCurrentStep:
      (labels?.compute.return.status !== true ||
        labels?.pullPath.status !== true) &&
      statusLabels.indexOf(pluginStatus) > 1 &&
      !error
        ? true
        : false,
    error: error,
  };

  status[4] = {
    id: 5,
    title: "Registering Files",
    status:
      statusLabels.indexOf(pluginStatus) > 3 && labels?.pullPath.status === true
        ? true
        : false,
    isCurrentStep: pluginStatus === "registeringFiles" ? true : false,
    error: error,
  };

  status[5] = {
    id: 6,
    title: `${
      pluginStatus === "finishedWithError"
        ? "Finished With Error"
        : pluginStatus === "cancelled"
        ? "Cancelled"
        : "Finished Successfully"
    }`,
    status: statusLabels.indexOf(pluginStatus) > 4 ? true : false,
    isCurrentStep:
      pluginStatus === "finishedSuccessfully" ||
      pluginStatus === "cancelled" ||
      pluginStatus === "finishedWithError"
        ? true
        : false,
    error,
  };

  return status;
}




