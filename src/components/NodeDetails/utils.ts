import { CheckIcon } from "@patternfly/react-icons";
import ClockIcon from "@patternfly/react-icons/dist/esm/icons/clock-icon";
import InProgress from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";
import TimesCircleIcon from "@patternfly/react-icons/dist/esm/icons/times-circle-icon";

/** Example label interface that might come back from the server. */
export interface PluginDetails {
  data: {
    status: string; // e.g. "waiting", "started", "cancelled", ...
    plugin_type: string; // e.g. "fs", "ds", ...
  };
}

/** Constants that help unify “finished” and “error” states. */
export const ERROR_STATUSES = ["finishedWithError", "cancelled"] as const;
export const FINISHED_STATUSES = [
  ...ERROR_STATUSES,
  "finishedSuccessfully",
] as const;

type ErrorStatus = (typeof ERROR_STATUSES)[number]; // "finishedWithError" | "cancelled"
type FinishedStatus = (typeof FINISHED_STATUSES)[number]; // "finishedWithError" | "cancelled" | "finishedSuccessfully"

/**
 * Hard-coded map of error codes to simplified messages (unchanged).
 */
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
  return errorMessage
    ? `ChRIS Internal Error: ${errorMessage}`
    : "ChRIS Internal Error";
}

/**
 * Gets a “start state” for an in-progress plugin.
 */
function getStartState(pluginStatus: string): string {
  return pluginStatus === "scheduled" || pluginStatus === "started"
    ? pluginStatus
    : "started";
}

/**
 * Gets the “end state” if it's one of the FINISHED_STATUSES; otherwise “Waiting To Finish”.
 */
function getEndState(pluginStatus: string): string {
  return FINISHED_STATUSES.includes(pluginStatus as FinishedStatus)
    ? pluginStatus
    : "Waiting To Finish";
}

/**
 * Helper to see if we are 'waiting' or not.
 */
function getWaitingStatus(
  pluginDetails: PluginDetails,
  currentLabel: number,
  previousStatus: string,
): boolean {
  // If it's an 'fs' plugin, wait after index 0.
  // Otherwise only wait if the previous plugin ended successfully.
  return pluginDetails.data.plugin_type === "fs"
    ? currentLabel > 0
    : currentLabel > 0 && previousStatus === "finishedSuccessfully";
}

/** Define what each portion of the `labels` might look like. */
interface StatusObject {
  status?: boolean; // e.g. true if step is done
  job_status?: string; // e.g. "finishedSuccessfully", "cancelled", ...
}

interface StrictPluginStatusLabels {
  pushPath?: StatusObject;
  pullPath?: StatusObject;
  swiftPut?: StatusObject;

  compute?: {
    submit?: StatusObject;
    return?: StatusObject;
  };

  error?: boolean; // e.g. if there's some global error
  currentStep?: string; // e.g. "transmit", "compute"
  title?: string; // e.g. for display
}

/** If not all properties are guaranteed, we can keep them partial. */
export type PluginStatusLabels = Partial<StrictPluginStatusLabels>;

/** Simple function to show an overall textual description (optional). */
export function displayDescription(label: PluginStatusLabels) {
  if (label.error) {
    return "Error in compute";
  }
  if (label.currentStep) {
    return label.title || "";
  }
  return "";
}

/**
 * Helper to decide which icon to render for a step,
 * based on error/finish/process booleans.
 */
function getStepIcon(args: {
  error: boolean;
  finish: boolean;
  process: boolean;
}): React.ComponentType<any> {
  const { error, finish, process } = args;

  if (error) return TimesCircleIcon; // error icon
  if (finish) return CheckIcon; // success icon
  if (process) return InProgress; // spinner icon
  return ClockIcon; // idle/waiting icon
}

/**
 * Returns an array of step descriptors that represent the progress states
 * for a single plugin, including a final step (index 6) to handle
 * “cancelled” or “finishedWithError”.
 */
export function getStatusLabels(
  labels: PluginStatusLabels,
  pluginDetails: PluginDetails,
  previousStatus: string,
) {
  // Each item represents how we want to display that step in the UI.
  type StatusItem = {
    description: string;
    process: boolean; // if we should show the spinner
    wait: boolean; // if step is waiting for something prior
    finish: boolean; // if step is fully done
    error: boolean; // if step encountered an error
    icon: React.ComponentType<any>;
  };

  const status: StatusItem[] = [];

  const pluginStatus = pluginDetails.data.status;
  const startState = getStartState(pluginStatus);
  const endState = getEndState(pluginStatus);

  // The distinct steps in the plugin's lifecycle:
  const steps = [
    "waiting", // index 0
    startState, // 1
    "transmit", // 2
    "compute", // 3
    "syncData", // 4
    "registeringFiles", // 5
    endState, // 6 (could be "finishedSuccessfully", "cancelled", or "finishedWithError")
  ];

  // figure out which step index the plugin is currently on
  const currentLabel = steps.indexOf(pluginStatus);
  const waitingStatus = getWaitingStatus(
    pluginDetails,
    currentLabel,
    previousStatus,
  );

  // A small helper to see if the overall plugin is in an error status
  const pluginIsInError = ERROR_STATUSES.includes(pluginStatus as ErrorStatus);

  // STEP 0
  {
    const stepIndex = 0;
    const stepReached = currentLabel >= stepIndex || pluginStatus === "waiting";

    const stepError =
      // Mark step as error if the plugin is in error
      // and the plugin reached or is at this step.
      pluginIsInError && stepReached;

    const stepFinish =
      // We consider "waiting" step "finished" if we are already
      // past 'waiting' or we've started or ended the plugin
      !stepError && waitingStatus;

    const stepProcess =
      // Show spinner if we are actively "waiting" in the plugin
      pluginStatus === "waiting";

    status[0] = {
      description: "Waiting",
      process: stepProcess,
      wait: false,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 1: Started
  {
    const stepIndex = 1;
    const stepReached = currentLabel >= stepIndex;

    const stepError = pluginIsInError && stepReached;
    const stepFinish =
      !stepError && (labels?.pushPath?.status === true || currentLabel === 6);

    const stepProcess =
      ["scheduled", "created", "started"].includes(pluginStatus) && !labels; // or your own condition

    status[1] = {
      description: "Started",
      process: stepProcess,
      wait: !waitingStatus,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 2: Transmitting
  {
    const stepIndex = 2;
    const stepReached = currentLabel >= stepIndex;
    const stepError =
      pluginIsInError &&
      stepReached &&
      // If we wanted to ensure that the error specifically
      // happens after we attempt the “transmit”:
      // currentLabel === stepIndex || (some condition)...

      // simpler approach:
      pluginIsInError;

    const stepFinish = !stepError && labels?.pushPath?.status === true;

    const stepProcess =
      pluginStatus === "started" &&
      !stepFinish && // if pushPath isn't done
      stepReached;

    status[2] = {
      description: "Transmitting",
      process: stepProcess,
      wait: !status[1].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 3: Computing
  {
    const stepIndex = 3;
    const stepReached = currentLabel >= stepIndex;

    // e.g. the plugin job might have been cancelled in the middle of compute
    const computeJobStatus = labels?.compute?.return?.job_status;
    const stepError =
      (pluginIsInError && stepReached) ||
      ERROR_STATUSES.includes((computeJobStatus ?? "") as ErrorStatus);

    const stepFinish = Boolean(
      !stepError &&
        labels?.compute?.return?.status &&
        labels?.compute?.submit?.status &&
        FINISHED_STATUSES.includes((computeJobStatus ?? "") as FinishedStatus),
    );

    const stepProcess =
      !stepError &&
      !stepFinish &&
      stepReached &&
      status[2].finish &&
      !!labels?.compute?.submit?.status &&
      !labels?.compute?.return?.status;

    status[3] = {
      description: "Computing",
      process: stepProcess,
      wait: !status[2].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 4: syncData / "Receiving"
  {
    const stepIndex = 4;
    const stepReached = currentLabel >= stepIndex;
    const stepError =
      pluginIsInError &&
      stepReached &&
      // If you specifically want “cancelled while receiving” to show here:
      currentLabel >= stepIndex;

    const stepFinish = !stepError && !!labels?.pullPath?.status;

    const stepProcess =
      !stepError && stepReached && status[3].finish && !stepFinish;

    status[4] = {
      description: "Receiving",
      process: stepProcess,
      wait: !status[3].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 5: registeringFiles
  {
    const stepIndex = 5;
    const stepReached = currentLabel >= stepIndex;
    const stepError = pluginIsInError && stepReached;

    const stepFinish =
      !stepError &&
      status[4].finish &&
      FINISHED_STATUSES.includes(pluginStatus as FinishedStatus);

    const stepProcess =
      !stepError &&
      pluginStatus === "registeringFiles" &&
      stepReached &&
      status[4].finish;

    status[5] = {
      description: "Registering Files",
      process: stepProcess,
      wait: !status[4].finish,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  // STEP 6: final (finishedSuccessfully, cancelled, or finishedWithError)
  {
    const stepIndex = 6;
    const stepReached = currentLabel >= stepIndex;
    const stepError = pluginIsInError && stepReached;

    const isReallyFinished = FINISHED_STATUSES.includes(
      pluginStatus as FinishedStatus,
    );

    const stepFinish = isReallyFinished && !stepError;
    const stepProcess = false; // never show spinner if we’re in a final state

    status[6] = {
      description:
        pluginStatus === "finishedSuccessfully"
          ? "Finished Successfully"
          : pluginStatus === "cancelled"
            ? "Cancelled"
            : pluginStatus === "finishedWithError"
              ? "Finished With Error"
              : "Waiting To Finish",
      process: stepProcess,
      wait: false,
      finish: stepFinish,
      error: stepError,
      icon: getStepIcon({
        error: stepError,
        finish: stepFinish,
        process: stepProcess,
      }),
    };
  }

  return status;
}
