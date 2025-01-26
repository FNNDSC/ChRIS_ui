import InProgress from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";
import FileArchive from "@patternfly/react-icons/dist/esm/icons/file-archive-icon";
import DownloadIcon from "@patternfly/react-icons/dist/esm/icons/download-icon";
import FillRightCircle from "@patternfly/react-icons/dist/esm/icons/caret-right-icon";
import FillLeftCircle from "@patternfly/react-icons/dist/esm/icons/caret-left-icon";
import ClockIcon from "@patternfly/react-icons/dist/esm/icons/clock-icon";

export function displayDescription(label: any) {
  if (label.error) {
    return "Error in compute";
  }
  if (label.currentStep) {
    return label.title;
  }
  return "";
}

// Hard-coded map of error codes to simplified error messages
export function getErrorCodeMessage(errorCode: string) {
  const errorCodeMap: Record<string, string> = {
    CODE01: "Error submitting job to pfcon url",
    CODE02: "Error getting job status at pfcon",
    CODE03: "Error fetching zip from pfcon url",
    CODE04: "Received bad zip file from remote",
    CODE05:
      "Couldn't find any plugin instance with correct ID while processing input instances to ts plugin instance",
    CODE06: "Error while listing swift storage files",
    CODE07: "Error while uploading file to swift storage",
    CODE08: "Error while downloading file from swift storage",
    CODE09: "Error while copying file in swift storage",
    CODE10: "Got undefined status from remote",
    CODE11:
      "Error while listing swift storage files; presumable eventual consistency problem",
    CODE12: "Error deleting job from pfcon",
  };

  const errorMessage = errorCodeMap[errorCode];
  if (errorMessage) {
    return `ChRIS Internal Error: ${errorMessage}`;
  }
  return "ChRIS Internal Error";
}

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

interface StrictPluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    return: unknown;
    status: boolean;
    submit: unknown;
  };
  swiftPut: { [key: string]: boolean };
  pullPath: { [key: string]: boolean };
}

export type PluginStatusLabels = Partial<StrictPluginStatusLabels>;

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
