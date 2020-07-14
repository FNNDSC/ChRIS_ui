import React from "react";
import { Steps } from "antd";
import { Spinner, Split, SplitItem } from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import "antd/dist/antd.css";
import ReactJSON from "react-json-view";

const { Step } = Steps;

export interface PluginStatusProps {
  pluginStatus?: string;
  pluginLog?: {};
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
export interface Logs {
  [info: string]: {
    [key: string]: {};
  };
}

export interface LogStatus {
  [key: string]: {};
}

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  pluginLog,
  direction,
  progressDot,
  icon,
  description,
  title,
}) => {
  const pluginStatusLabels: PluginStatusLabels =
    pluginStatus && JSON.parse(pluginStatus);

  const src: Logs | undefined = pluginLog && pluginLog;
  let logs: LogStatus = {};

  if (src && src.info) {
    logs["pushPath"] = src.info.pushPath;
    logs["compute"] = src.info.compute;
    logs["pullPath"] = src.info.pullPath;
    logs["swiftPut"] = src.info.swiftPut;
  }

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
      <div className="file-browser">
        <Split gutter="md" className="file-browser__flex1">
          <SplitItem className="file-browser__flex__item1">
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
          </SplitItem>

          <SplitItem className="file-browser__flex__item2">
            {logs && (
              <ReactJSON
                name={false}
                displayDataTypes={false}
                style={{
                  fontSize: "16px",
                }}
                displayObjectSize={false}
                src={logs}
              />
            )}
          </SplitItem>
        </Split>
      </div>
    );
  }
  return <Spinner size="lg" />;
};

export default PluginStatus;
