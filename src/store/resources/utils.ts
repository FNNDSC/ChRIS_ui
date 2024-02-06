import { PluginStatusLabels } from "./types";
import InProgress from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";
import FileArchive from "@patternfly/react-icons/dist/esm/icons/file-archive-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import FillRightCircle from "@patternfly/react-icons/dist/esm/icons/caret-right-icon";
import FillLeftCircle from "@patternfly/react-icons/dist/esm/icons/caret-left-icon";
import ClockIcon from "@patternfly/react-icons/dist/esm/icons/clock-icon";

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: any,
  previousStatus: string,
) {
  const status = [];
  const pluginStatus = pluginDetails.data.status;
  const errorStatuses = ["finishedWithError", "cancelled"];
  const finishedStatuses = [...errorStatuses, "finishedSuccessfully"];

  const startState =
    pluginStatus === "scheduled" || pluginStatus === "started"
      ? pluginStatus
      : "started";

  const endState = finishedStatuses.includes(pluginStatus)
    ? pluginStatus
    : "Waiting To Finish";

  const steps = [
    "waiting",
    startState,
    "transmit",
    "compute",
    "syncData",
    "registeringFiles",
    endState,
  ];
  const currentLabel = steps.indexOf(pluginStatus);

  let waitingStatus = false;
  if (pluginDetails.data.plugin_type === "fs") {
    waitingStatus = currentLabel > 0 ? true : false;
  } else {
    waitingStatus =
      currentLabel > 0 && previousStatus === "finishedSuccessfully"
        ? true
        : false;
  }

  status[0] = {
    description: "Waiting",
    process: pluginStatus === "waiting" ? true : false,
    wait: false,
    finish: waitingStatus,
    error:
      errorStatuses.includes(pluginStatus) &&
      errorStatuses.includes(previousStatus)
        ? true
        : false,
    icon: ClockIcon,
  };

  status[1] = {
    description: "Started",
    process:
      ["scheduled", "created", "started"].includes(pluginStatus) && !labels
        ? true
        : false,
    wait: status[0].finish !== true,
    finish:
      (labels && labels.pushPath.status === true) || currentLabel === 6
        ? true
        : false,
    error: false,
    icon: InProgress,
  };

  status[2] = {
    description: "Transmitting",
    process:
      pluginStatus === "started" && labels && labels.pushPath.status !== true
        ? true
        : false,
    wait: !labels || status[1].finish !== true,
    finish: labels && labels.pushPath.status === true ? true : false,
    error:
      labels &&
      labels.pushPath.status !== true &&
      errorStatuses.includes(pluginStatus)
        ? true
        : false,
    icon: DownloadIcon,
  };

  status[3] = {
    description: "Computing",
    process:
      pluginStatus === "started" &&
      status[2].finish &&
      labels &&
      labels.compute.submit.status &&
      !labels.compute.return.status
        ? true
        : false,
    wait: !labels || status[2].finish !== true,
    finish:
      labels &&
      labels.compute.return.status === true &&
      labels.compute.submit.status === true &&
      finishedStatuses.includes(labels.compute.return.job_status)
        ? true
        : false,
    error:
      (labels && errorStatuses.includes(labels.compute.return.job_status)) ||
      (labels &&
        labels.compute.return.status !== true &&
        errorStatuses.includes(pluginStatus) &&
        labels.pushPath.status === true)
        ? true
        : false,
    icon: FillRightCircle,
  };

  status[4] = {
    description: "Receiving",
    process:
      pluginStatus === "started" &&
      labels &&
      !labels.pullPath.status &&
      status[3].finish === true
        ? true
        : false,
    wait: !labels || status[3].finish !== true,
    finish: labels && labels.pullPath.status === true,
    error: false,
    icon: FillLeftCircle,
  };

  status[5] = {
    description: "Registering Files",
    process:
      pluginStatus === "registeringFiles" &&
      status[4].finish &&
      currentLabel > 1,
    wait: status[4].finish !== true,
    finish:
      labels &&
      labels.pullPath.status === true &&
      finishedStatuses.includes(pluginStatus) === true
        ? true
        : false,
    error: false,
    icon: FileArchive,
  };

  return status;
}
