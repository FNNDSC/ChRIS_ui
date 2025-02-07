import React from "react";

import FillCheckIcon from "@patternfly/react-icons/dist/esm/icons/check-icon";
import ExclaimationIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import { useAppSelector } from "../../store/hooks";
import { SpinContainer } from "../Common";
import { Spin } from "antd";
import { ClockIcon } from "@patternfly/react-icons";

const StatusTitle = ({ pluginStatus }: { pluginStatus: any }) => {
  const selected = useAppSelector((state) => state.instance.selectedPlugin);

  let statusTitle:
    | {
        title: string;
        icon: any;
      }
    | undefined = undefined;

  const finishedStatuses = [
    "finishedSuccessfully",
    "finishedWithError",
    "cancelled",
  ];

  statusTitle =
    selected && finishedStatuses.includes(selected.data.status) === true
      ? getFinishedTitle(selected.data.status)
      : pluginStatus
        ? getCurrentTitleFromStatus(pluginStatus)
        : { title: "processing...", icon: ClockIcon };

  if (!pluginStatus && !statusTitle) {
    return <span>Failed to fetch status</span>;
  }

  if (statusTitle) {
    return (
      <>
        <span style={{ marginRight: "0.25em" }}>{<statusTitle.icon />}</span>
        <span>{statusTitle.title} </span>{" "}
      </>
    );
  }
  return <SpinContainer title="Fetching plugin's execution status" />;
};

const StatusTitleMemoed = React.memo(StatusTitle);
export default StatusTitleMemoed;

export function getCurrentTitleFromStatus(statusLabels: any[]) {
  const length = statusLabels.length;
  let title = statusLabels[length - 1].description;
  let icon = statusLabels[length - 1].icon;
  statusLabels.forEach((label) => {
    if (label.process === true) {
      title = label.description;
      icon = label.icon;
    }
  });

  return { title, icon };
}

export function getFinishedTitle(pluginStatus: string) {
  const title =
    pluginStatus === "finishedSuccessfully"
      ? "Finished Successfully"
      : pluginStatus === "cancelled"
        ? "Cancelled"
        : pluginStatus === "finishedWithError"
          ? "FinishedWithError"
          : "";
  const icon =
    pluginStatus === "finishedSuccessfully"
      ? FillCheckIcon
      : pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
        ? ExclaimationIcon
        : null;

  return {
    title,
    icon,
  };
}
