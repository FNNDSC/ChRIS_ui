import React from "react";
import { Skeleton } from "@patternfly/react-core";
import usePluginInstanceResource from "./usePluginInstanceResource";
import { PluginStatus } from "../../../store/resources/types";

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
  } else
    return (
      <Skeleton
        width="15%"
        screenreaderText="Fetching plugin's execution status"
      />
    );
};

export default React.memo(StatusTitle);

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
