import { PluginStatus, PluginStatusLabels } from "./types";
export function getStatusLabels(labels: PluginStatusLabels): PluginStatus[] {
  let label = [];

  const isError = labels.compute.return.l_status[0] === "finishedWithError";
  const isComputeSuccessful = isError ? false : true;

  label[0] = {
    step: "pushPath",
    status: labels.pushPath.status,
    id: 1,
    previous: "none",
    title: "Transmit Data",
    previousComplete: true,
    error: false,
  };

  label[1] = {
    step: "computeSubmit",
    id: 2,
    status: labels.compute.submit.status,
    title: "Setup Compute Environment",
    previous: "pushPath",
    previousComplete: labels.pushPath.status === true,
    error: false,
  };

  label[2] = {
    step: "computeReturn",
    id: 3,
    status:
      labels.compute.return.status &&
      labels.compute.status &&
      isComputeSuccessful,
    title: "Compute",
    previous: "computeSubmit",
    previousComplete: labels.compute.submit.status,
    error: isError,
  };

  label[3] = {
    step: "pullPath",
    id: 4,
    status: labels.pullPath.status,
    title: "Sync Data",
    previous: "computeReturn",
    previousComplete:
      labels.compute.return.status === true &&
      labels.compute.status === true &&
      isComputeSuccessful,
    error: isError,
  };
  label[4] = {
    id: 5,
    step: "swiftPut",
    status: labels.swiftPut.status,
    title: "Finish Up",
    previous: "pullPath",
    previousComplete: labels.pullPath.status === true,
    error: isError,
  };

  return label;
}
