import type { PluginStatusLabels } from "./types";
import InProgress from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";
import FileArchive from "@patternfly/react-icons/dist/esm/icons/file-archive-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import FillRightCircle from "@patternfly/react-icons/dist/esm/icons/caret-right-icon";
import FillLeftCircle from "@patternfly/react-icons/dist/esm/icons/caret-left-icon";
import ClockIcon from "@patternfly/react-icons/dist/esm/icons/clock-icon";

interface PluginDetails {
  data: {
    status: string;
    plugin_type: string;
  };
}

const ERROR_STATUSES = ["finishedWithError", "cancelled"];
const FINISHED_STATUSES = [...ERROR_STATUSES, "finishedSuccessfully"];

function getStartState(pluginStatus: string): string {
  return pluginStatus === "scheduled" || pluginStatus === "started"
    ? pluginStatus
    : "started";
}

function getEndState(pluginStatus: string): string {
  return FINISHED_STATUSES.includes(pluginStatus)
    ? pluginStatus
    : "Waiting To Finish";
}

function getWaitingStatus(
  pluginDetails: PluginDetails,
  currentLabel: number,
  previousStatus: string,
): boolean {
  return pluginDetails.data.plugin_type === "fs"
    ? currentLabel > 0
    : currentLabel > 0 && previousStatus === "finishedSuccessfully";
}

export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: PluginDetails,
  previousStatus: string,
) {
  const status: any[] = [];
  const pluginStatus = pluginDetails.data.status;
  const startState = getStartState(pluginStatus);
  const endState = getEndState(pluginStatus);
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
  const waitingStatus = getWaitingStatus(
    pluginDetails,
    currentLabel,
    previousStatus,
  );

  status[0] = {
    description: "Waiting",
    process: pluginStatus === "waiting",
    wait: false,
    finish: waitingStatus,
    error:
      ERROR_STATUSES.includes(pluginStatus) &&
      ERROR_STATUSES.includes(previousStatus),
    icon: ClockIcon,
  };

  status[1] = {
    description: "Started",
    process:
      ["scheduled", "created", "started"].includes(pluginStatus) && !labels,
    wait: !waitingStatus,
    finish: labels?.pushPath.status === true || currentLabel === 6,
    error: false,
    icon: InProgress,
  };

  status[2] = {
    description: "Transmitting",
    process: pluginStatus === "started" && labels?.pushPath.status !== true,
    wait: !labels || !status[1].finish,
    finish: labels?.pushPath.status === true,
    error:
      labels?.pushPath.status !== true && ERROR_STATUSES.includes(pluginStatus),
    icon: DownloadIcon,
  };

  status[3] = {
    description: "Computing",
    process:
      pluginStatus === "started" &&
      status[2].finish &&
      labels?.compute.submit.status &&
      !labels.compute.return.status,
    wait: !labels || !status[2].finish,
    finish:
      labels?.compute.return.status === true &&
      labels.compute.submit.status === true &&
      FINISHED_STATUSES.includes(labels.compute.return.job_status),
    error:
      (labels && ERROR_STATUSES.includes(labels.compute.return.job_status)) ||
      (labels &&
        !labels.compute.return.status &&
        ERROR_STATUSES.includes(pluginStatus) &&
        labels.pushPath.status === true),
    icon: FillRightCircle,
  };

  status[4] = {
    description: "Receiving",
    process:
      pluginStatus === "started" &&
      labels &&
      !labels.pullPath.status &&
      status[3].finish,
    wait: !labels || !status[3].finish,
    finish: labels?.pullPath.status === true,
    error: false,
    icon: FillLeftCircle,
  };

  status[5] = {
    description: "Registering Files",
    process:
      pluginStatus === "registeringFiles" &&
      status[4].finish &&
      currentLabel > 1,
    wait: !status[4].finish,
    finish:
      labels?.pullPath.status === true &&
      FINISHED_STATUSES.includes(pluginStatus),
    error: false,
    icon: FileArchive,
  };

  return status;
}
