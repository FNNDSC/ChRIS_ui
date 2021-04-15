import React from "react";
import usePluginInstanceResource from "./usePluginInstanceResource";
import { PluginStatus } from "../../../store/feed/types";
import { Skeleton } from "@patternfly/react-core";

const StatusTitle = () => {
  const pluginInstanceResource = usePluginInstanceResource();

  let statusTitle:
    | {
        title: string;
        icon: any;
      }
    | undefined = undefined;
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus;

  if (pluginStatus) {
    statusTitle = getCurrentTitleFromStatus(pluginStatus);
  }

  if (statusTitle) {
    return (
      <>
        <span>{<statusTitle.icon />}</span>
        <span>{statusTitle.title} </span>{" "}
      </>
    );
  } else return <Skeleton width="25%"></Skeleton>;
};

export default StatusTitle;

function getCurrentTitleFromStatus(statusLabels: PluginStatus[]) {
  const title = statusLabels
    .map((label) => {
      if (label.isCurrentStep === true) {
        return { title: label.title, icon: label.icon };
      } else return undefined;
    })
    .filter((label) => label && label);

  return title[0];
}
