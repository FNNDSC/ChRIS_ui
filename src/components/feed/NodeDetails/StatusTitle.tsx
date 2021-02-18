import React from "react";
import { connect } from "react-redux";
import { ApplicationState } from "../../../store/root/applicationState";
import { getSelectedInstanceResource } from "../../../store/feed/selector";
import { ResourcePayload, PluginStatus } from "../../../store/feed/types";
import { Skeleton } from "@patternfly/react-core";

interface StatusTitleProps {
  pluginInstanceResource?: ResourcePayload;
}

const StatusTitle = ({ pluginInstanceResource }: StatusTitleProps) => {
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

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: getSelectedInstanceResource(state),
});

export default connect(mapStateToProps, null)(StatusTitle);

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
