
import { PluginStatusLabels } from "./types";
import {
  InProgressIcon,
  OutlinedClockIcon,
  FileArchiveIcon,
  CheckIcon,
  OnRunningIcon,
  ErrorCircleOIcon,
  OutlinedArrowAltCircleRightIconConfig,
  OutlinedArrowAltCircleLeftIconConfig,
} from "@patternfly/react-icons";


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
    "syncData",
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
    description: "Waiting to be scheduled",
    icon: OutlinedClockIcon,
  };

  status[1] = {
    id: 2,
    title: "Scheduled",
    status: statusLabels.indexOf(pluginStatus) > 1 ? true : false,
    isCurrentStep: pluginDetails.data.status === "scheduled" ? true : false,
    error,
    description: "Scheduling to the worker",
    icon: InProgressIcon,
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
    description: "Starting on compute env",
    icon: OnRunningIcon,
  };

  status[3] = {
    id: 4,
    title: "Compute",
    status:
      labels?.compute.return.status === true &&
      labels?.compute.submit.status === true &&
      isComputeSuccessful &&
      statusLabels.indexOf(pluginStatus) > 2
        ? true
        : false,
    isCurrentStep:
      (labels?.compute.return.status !== true ||
        labels?.compute.submit.status !== true) &&
      statusLabels.indexOf(pluginStatus) > 1 &&
      !error
        ? true
        : false,
    error: error,
    description: "Computing",
    icon: OutlinedArrowAltCircleRightIconConfig,
  };

  status[4] = {
    id: 5,
    title: "Pulling from Remote Compute",
    status:
      labels?.pullPath.status === true && statusLabels.indexOf(pluginStatus) > 2
        ? true
        : false,
    isCurrentStep:
      labels?.compute.return.status    === true &&
     
     
     
      labels?.pullPath.status !== true &&
      statusLabels.indexOf(pluginStatus) > 1 &&
      !error
        ? true
        : false,
    error: error,
    description: "Pulling from Remote Compute",
    icon: OutlinedArrowAltCircleLeftIconConfig,
  };

  status[5] = {
    id: 6,
    title: "Registering Files",
    status: statusLabels.indexOf(pluginStatus) > 5 ? true : false,
    isCurrentStep:
      pluginStatus === "registeringFiles" &&
      labels.pullPath.status === true &&
      statusLabels.indexOf(pluginStatus) > 2
        ? true
        : false,
    error: error,
    description: "Registering output files",
    icon: FileArchiveIcon,
  };

  status[6] = {
    id: 7,
    title: `${
      pluginStatus === "finishedWithError"
        ? "Finished With Error"
        : pluginStatus === "cancelled"
        ? "Cancelled"
        : "Finished Successfully"
    }`,
    status: statusLabels.indexOf(pluginStatus) > 5 ? true : false,
    isCurrentStep:
      pluginStatus === "finishedSuccessfully" ||
      pluginStatus === "cancelled" ||
      pluginStatus === "finishedWithError"
        ? true
        : false,
    error,
    description:
      pluginStatus === "finishedSuccessfully"
        ? "Finished Successfully"
        : pluginStatus === "cancelled"
        ? "Cancelled"
        : pluginStatus === "finishedWithError"
        ? "Finished With Error"
        : "Waiting to Finish",
    icon:
      pluginStatus === "finishedSuccessfully"
        ? CheckIcon
        : pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
        ? ErrorCircleOIcon
        : null,
  };

  

  return status;
}




