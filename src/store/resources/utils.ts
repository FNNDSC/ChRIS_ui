import { PluginStatusLabels } from "./types";
import {
  InProgressIcon,
  OutlinedClockIcon,
  FileArchiveIcon,
  CheckIcon,
  OnRunningIcon,
  ErrorCircleOIcon,
  OutlinedArrowAltCircleRightIcon,
  OutlinedArrowAltCircleLeftIcon,
} from "@patternfly/react-icons";

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any
) {
  const status = [];

  const statusLabels = [
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
  const error =
    pluginDetails.data.status === "finishedWithError" ||
    pluginDetails.data.status === "cancelled"
      ? true
      : false;

  status[0] = {
    id: 1,
    title: "Waiting",
    status: statusLabels.indexOf(pluginStatus) > 0 ? true : false,
    isCurrentStep: pluginDetails.data.status === "waiting",
    error,
    description: "Waiting",
    icon: OutlinedClockIcon,
  };

  status[1] = {
    id: 2,
    title: "Scheduling",
    status: statusLabels.indexOf(pluginStatus) > 1 ? true : false,
    isCurrentStep: pluginDetails.data.status === "scheduled" ? true : false,
    error,
    description: "Scheduling",
    icon: InProgressIcon,
  };

  status[2] = {
    id: 3,
    title: "Transmitting",
    status: labels?.pushPath.status === true ? true : false,
    isCurrenStep:
      pluginDetails.data.status === "started" && labels.pushPath.status !== true
        ? true
        : false,
    error,
    description: "Transmitting",
    icon: OnRunningIcon,
  };

  status[3] = {
    id: 4,
    title: "Computing",
    status:
      labels?.compute.return.status === true &&
      labels?.compute.submit.status === true
        ? true
        : false,
    isCurrentStep:
      (labels?.compute.return.status !== true ||
        labels?.compute.submit.status !== true) &&
      statusLabels.indexOf(pluginStatus) > 1 &&
      !error
        ? true
        : false,
    error,
    description: "Computing",
    icon: OutlinedArrowAltCircleRightIcon,
  };

  status[4] = {
    id: 5,
    title: "Receiving",
    status: labels?.pullPath.status === true ? true : false,
    isCurrentStep:
      labels?.compute.return.status === true &&
      labels?.pullPath.status !== true &&
      statusLabels.indexOf(pluginStatus) > 1 &&
      !error
        ? true
        : false,
    error,
    description: "Receiving",
    icon: OutlinedArrowAltCircleLeftIcon,
  };

  status[5] = {
    id: 6,
    title: "Registering",
    status:
      statusLabels.indexOf(pluginStatus) > 5 && labels.pullPath.status === true
        ? true
        : false,
    isCurrentStep:
      pluginStatus === "registeringFiles" &&
      labels.pullPath.status === true &&
      statusLabels.indexOf(pluginStatus) > 2
        ? true
        : false,
    error,
    description: "Registering",
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
    status:
      pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
        ? false
        : statusLabels.indexOf(pluginStatus) > 5
        ? true
        : false,
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
