import React from "react";
import { connect } from "react-redux";
import { Steps, Popover } from "antd";
import { ApplicationState } from "../../../store/root/applicationState";
import { getSelectedInstanceResource } from "../../../store/feed/selector";
import { ResourcePayload } from "../../../store/feed/types";
import { Spinner } from "@patternfly/react-core";

const { Step } = Steps;

interface PluginStatusProps {
  pluginInstanceResource?: ResourcePayload;
}

const Status = ({ pluginInstanceResource }: PluginStatusProps) => {
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus;
  if (pluginStatus && pluginStatus.length > 0) {
    return (
      <Steps direction="horizontal" size="small">
        {pluginStatus.map((label: any) => {
          let showIcon = [
            "Finished Successfully",
            "Finished With Error",
            "Cancelled",
          ].includes(label.title)
            ? false
            : label.isCurrentStep
            ? true
            : false;

          return (
              <Step  
                title={label.title}
                key={label.id}
                icon={showIcon && <Spinner size="lg" />}
                status={
                  label.status === true
                    ? "finish"
                    : label.error === true
                    ? "error"
                    : undefined
                }
              />
            
          );
        })}
      </Steps>
    );
  } else return null;
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: getSelectedInstanceResource(state),
});

export default connect(mapStateToProps, null)(Status);
