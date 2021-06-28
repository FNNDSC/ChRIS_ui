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
    pluginStatus === "finishedWithError" || pluginStatus === "cancelled"
      ? true
      : false;

  const currentLabel = statusLabels.indexOf(pluginStatus);
 

  status[0] = {
    id: 1,
    title: "Waiting",
    status: currentLabel > 0 ? true : false,
    isCurrentStep: pluginStatus === "waiting" ? true : false,
    error,
    description: "Waiting",
    icon: OutlinedClockIcon,
    processError: false,
  };

  status[1] = {
    id: 2,
    title: "Scheduling",
    status: currentLabel > 1  ? true : false,
    isCurrentStep: pluginStatus === "scheduled" ? true : false,
    error,
    description: "Scheduling",
    icon: InProgressIcon,
    processError: status[0].status !== true && !labels && error ? true : false,
  };

  status[2] = {
    id: 3,
    title: "Transmitting",
    status: labels?.pushPath.status === true ? true : false,
    isCurrenStep:
      pluginStatus === "started" && labels?.pushPath.status !== true
        ? true
        : false,
    error,
    description: "Transmitting",
    icon: OnRunningIcon,
    processError: status[1].status !== true && !labels && error ? true : false,
  };

  status[3] = {
    id: 4,
    title: "Computing",
    status:
      labels?.compute.return.status === true &&
      labels?.compute.submit.status === true &&
      labels?.compute.return.job_status === "finishedSuccessfully"
        ? true
        : false,
    isCurrentStep:
      (labels?.compute.return.status !== true ||
        labels?.compute.submit.status !== true) &&
      currentLabel > 1 &&
      !error
        ? true
        : false,
    error,
    description: "Computing",
    icon: OutlinedArrowAltCircleRightIcon,
    processError: status[2].status !== true && error ? true : false,
  };

  status[4] = {
    id: 5,
    title: "Receiving",
    status: labels?.pullPath.status === true ? true : false,
    isCurrentStep:
      labels?.compute.return.status === true &&
      labels?.pullPath.status !== true &&
      currentLabel > 1 &&
      !error
        ? true
        : false,
    error,
    description: "Receiving",
    icon: OutlinedArrowAltCircleLeftIcon,
    processError: status[3].status !== true && error ? true : false,
  };

  status[5] = {
    id: 6,
    title: "Registering",
    status:
      statusLabels.indexOf(pluginStatus) > 5 && labels?.pullPath.status === true
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
    processError: status[4].status !== true && error ? true : false,
  };

  status[6] = {
    id: 7,
    title: `${
      pluginStatus === "finishedWithError"
        ? `Finished With Error`
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
    processError: false,
  };

  return status;
}
