import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Steps } from "antd";
import { Spinner } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import "antd/dist/antd.css";

const { Step } = Steps;

export interface PluginStatusProps {
  pluginStatus?: string;
  direction: "horizontal" | "vertical";
  progressDot: string;
  icon: string;
  description: string;
  title: string;
}

type Return = {
  [key: string]: [boolean];
};

type Status = {
  [key: string]: boolean;
};

type Submit = {
  submit: boolean;
};

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    [key: string]: Return & Status & Submit;
  };
  swiftPut: { [key: string]: boolean };
  pullPath: { [key: string]: boolean };
}

export interface Label {
  [key: string]: boolean;
}

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  direction,
  progressDot,
  icon,
  description,
  title,
}) => {
  const pluginStatusLabels: PluginStatusLabels =
    pluginStatus && JSON.parse(pluginStatus);

  let labels: Label = {};
  if (pluginStatusLabels) {
    labels["pushPath"] = pluginStatusLabels.pushPath.status;
    labels["computeReturn"] = pluginStatusLabels.compute.return.status;
    labels["computeSubmit"] = pluginStatusLabels.compute.submit.status;
    labels["pullPath"] = pluginStatusLabels.pullPath.status;
    labels["swiftPut"] = pluginStatusLabels.swiftPut.status;

    let displayIcon =
      icon === "true" && labels["pushPath"] !== true ? (
        <Spinner size="md" />
      ) : (
        <CheckCircleIcon size="sm" />
      );

    let displayDescription = (label: string) => {
      return description === "true" && labels[label];
    };

    return (
      <Steps
        direction={direction}
        progressDot={progressDot === "true" ? true : false}
      >
        <Step
          title={title === "true" && "Push Path"}
          description={displayDescription("pushPath")}
          icon={displayIcon}
          className={
            labels["pushPath"] === true
              ? "ant-steps-item-active ant-steps-item-process"
              : "undefined"
          }
        />
        <Step
          title={title === "true" && "Compute Submit"}
          description={displayDescription("computeSubmit")}
          icon={displayIcon}
          className={
            labels["computeSubmit"] === true
              ? "ant-steps-item-active ant-steps-item-process"
              : "undefined"
          }
        />
        <Step
          title={title === "true" && "Compute Return"}
          description={displayDescription("computReturn")}
          icon={displayIcon}
          className={
            labels["computeReturn"] === true
              ? "ant-steps-item-active ant-steps-item-process"
              : "undefined"
          }
        />

        <Step
          title={title === "true" && "PullPath"}
          description={displayDescription("pullPath")}
          icon={displayIcon}
          className={
            labels["pullPath"] === true
              ? "ant-steps-item-active ant-steps-item-process"
              : "undefined"
          }
        />
        <Step
          title={title === "true" && "Swift Put"}
          description={displayDescription("swiftPut")}
          icon={displayIcon}
          className={
            labels["swiftPut"] === true
              ? "ant-steps-item-active ant-steps-item-process"
              : "undefined"
          }
        />
      </Steps>
    );
  }
  return (
    <FontAwesomeIcon
      title="This may take a while...."
      icon="spinner"
      pulse
      size="6x"
      color="black"
    />
  );
};

export default PluginStatus;
