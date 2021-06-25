import React from "react";

import { Steps } from "antd";

import { Spinner } from "@patternfly/react-core";
import usePluginInstanceResource from "./usePluginInstanceResource";

const { Step } = Steps;

const Status = () => {
  const pluginInstanceResource = usePluginInstanceResource();
  const pluginStatus =
    pluginInstanceResource && pluginInstanceResource.pluginStatus;

  if (pluginStatus && pluginStatus.length > 0) {
    return (
      <>
        <Steps
          className="node-details__status"
          direction="horizontal"
          size="small"
        >
          {pluginStatus.map((label: any) => {
            const showIcon = [
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
                key={label.id}
                icon={showIcon && <Spinner size="lg" />}
                status={
                  label.status === true
                    ? "finish"
                    : label.processError === true
                    ? "wait"
                    : label.error === true
                    ? "error"
                    : "process"
                }
              />
            );
          })}
        </Steps>
        <Steps
          direction="horizontal"
          size="small"
          className="node-details__status-descriptions"
        >
          {pluginStatus.map((label: any) => {
            return (
              <Step
                key={label.id}
                description={label.description}
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
      </>
    );
  } else return null;
};

export default React.memo(Status);
