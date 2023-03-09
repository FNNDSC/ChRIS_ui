import React from "react";
import { Tag } from "antd";
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
        color: string;
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
      <Tag
        style={{
          fontSize: "0.95rem",
        }}
        icon={<statusTitle.icon spin />}
        color={statusTitle.color}
      >
        {statusTitle.title}
      </Tag>
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

  return { title, icon, color: "processing" };
}

export function getFinishedTitle(pluginStatus: string) {
  const success = pluginStatus === "finishedSuccessfully" ? true : false;
  const cancelled = pluginStatus === "cancelled" ? true : false;
  const errored = pluginStatus === "finishedWithError" ? true : false;

  const title = success
    ? "Finished Successfully"
    : cancelled
    ? "Cancelled"
    : errored
    ? "Finished With Error"
    : "";
  const icon =
    pluginStatus === "finishedSuccessfully"
      ? AiFillCheckCircle
      : pluginStatus === "cancelled" || pluginStatus === "finishedWithError"
      ? AiFillExclamationCircle
      : null;

  const color = success ? "success" : errored || cancelled ? "error" : "";

  return { title, icon, color };
}
