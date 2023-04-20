import React from "react";

import usePluginInstanceResource from "./usePluginInstanceResource";
import { SpinContainer } from "../../common/loading/LoadingContent";
import { useTypedSelector } from "../../../store/hooks";
import { AiFillCheckCircle, AiFillExclamationCircle } from "react-icons/ai";

const StatusTitle = () => {
  const pluginInstanceResource = usePluginInstanceResource();
  const selected = useTypedSelector((state) => state.instance.selectedPlugin);

  let statusTitle:
    | {
        title: string;
        icon: any;
      }
    | undefined = undefined;
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus;

  const finishedStatuses = [
    "finishedSuccessfully",
    "finishedWithError",
    "cancelled",
  ];

  if (pluginStatus) {
    statusTitle =
      selected && finishedStatuses.includes(selected.data.status) === true
        ? getFinishedTitle(selected.data.status)
        : getCurrentTitleFromStatus(pluginStatus);
  }

  if (statusTitle) {
    return (
      <>
        <span style={{ marginRight: "0.25em" }}>{<statusTitle.icon />}</span>
        <span>{statusTitle.title} </span>{" "}
      </>
    );
  } else return <SpinContainer title="Fetching plugin's execution status" />;
};

export default React.memo(StatusTitle);

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
      ? AiFillCheckCircle
      : pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
      ? AiFillExclamationCircle
      : null;

  return {
    title,
    icon,
  };
}
