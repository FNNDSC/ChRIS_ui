import React from "react";
import { Steps } from "antd";
import { Spinner, Split, SplitItem } from "@patternfly/react-core";
import ReactJSON from "react-json-view";
import "antd/dist/antd.css";
import "../../explorer/file-detail.scss";
import classNames from "classnames";

const { Step } = Steps;

export interface PluginStatusProps {
  pluginStatus?: string;
  pluginLog?: {};
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
    [key: string]: {
      [key: string]: string;
    };
  };
}

export interface LogStatus {
  [key: string]: {};
}

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  pluginLog,
}) => {
  const [logs, setLogs] = React.useState({});
  const [logTitle, setLogTitle] = React.useState("");

  const pluginStatusLabels: PluginStatusLabels =
    pluginStatus && JSON.parse(pluginStatus);

  const src: Logs | undefined = pluginLog && pluginLog;
  let pluginLogs: LogStatus = {};

  if (src && src.info) {
    pluginLogs["pushPath"] = src.info.pushPath.return;
    pluginLogs["computeSubmit"] = src.info.compute.submit;
    pluginLogs["computeReturn"] = src.info.compute.return;
    pluginLogs["pullPath"] = src.info.pullPath.return;
    pluginLogs["swiftPut"] = src.info.swiftPut.return;
  }

  const handleClick = (step: string, title: string) => {
    let currentLog = pluginLogs[step];
    if (currentLog) {
      setLogs(currentLog);
      setLogTitle(title);
    }
  };

  if (pluginStatusLabels) {
    let labels = getStatusLabels(pluginStatusLabels);
    return (
      <div className="file-browser">
        <Split gutter="md" className="file-browser__flex1">
          <SplitItem className="file-browser__flex__item1">
            <Steps direction="vertical">
              {labels.map((label: any) => {
                const currentDescription = displayDescription(label);
                let showIcon: boolean = false;

                if (currentDescription) {
                  showIcon =
                    currentDescription ===
                      "transmitting data to compute environment" ||
                    currentDescription === "computing" ||
                    currentDescription === "finishing up" ||
                    currentDescription === "setting compute environment" ||
                    currentDescription ===
                      "syncing data from compute environment";
                }
                return (
                  <Step
                    onClick={() => {
                      handleClick(label.step, label.title);
                    }}
                    description={currentDescription}
                    className={classNames("file-browser__step")}
                    key={label.id}
                    title={
                      <span
                        className="file-browser__step-title"
                        onClick={() => {
                          handleClick(label.step, label.title);
                        }}
                      >
                        {label.title}
                      </span>
                    }
                    icon={showIcon && <Spinner size="lg" />}
                    status={label.status === true ? "finish" : "wait"}
                  />
                );
              })}
            </Steps>
          </SplitItem>
          <div className="divider"></div>

          <SplitItem className="file-browser__flex__item2">
            <div className="json-display">
              <div className="header-panel">
                <h1>
                  {Object.keys(logs).length > 0 &&
                    `Showing logs for ${logTitle} :`}
                </h1>
              </div>
              <div className="file-browser__flex__item2-json">
                {logs && (
                  <ReactJSON
                    name={false}
                    displayDataTypes={false}
                    style={{
                      fontSize: "16px",
                    }}
                    displayObjectSize={false}
                    src={logs}
                    indentWidth={4}
                    collapsed={true}
                  />
                )}
              </div>
            </div>
          </SplitItem>
        </Split>
      </div>
    );
  }
  return <Spinner size="lg" />;
};

/**
 * Utility Functions
 */

export default PluginStatus;

function getStatusLabels(labels: PluginStatusLabels) {
  let label = [];

  label[0] = {
    step: "pushPath",
    status: labels.pushPath.status,
    id: 1,
    title: "Transmit Data",
  };

  label[1] = {
    step: "computeSubmit",
    id: 2,
    status: labels.compute.submit.status,
    title: "Setup Compute Environment",
    previous: "pushPath",
    previousComplete: labels.pushPath.status === true,
  };

  label[2] = {
    step: "computeReturn",
    id: 3,
    status: labels.compute.return.status,
    title: "Compute",
    previous: "computeSubmit",
    previousComplete: labels.compute.submit.status === true,
  };

  label[3] = {
    step: "pullPath",
    id: 4,
    status: labels.pullPath.status,
    title: "Sync Data",
    previous: "computeReturn",
    previousComplete: labels.compute.return.status === true,
  };
  label[4] = {
    step: "swiftPut",
    id: 5,
    status: labels.swiftPut.status,
    title: "Finish Up",
    previous: "pullPath",
    previousComplete: labels.pullPath.status === true,
  };

  return label;
}

function displayDescription(label: any) {
  if (label.status === "pushing") {
    return "transmitting data to compute environment";
  } else if (
    label.previous === "pushPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "setting compute environment";
  } else if (
    label.previous === "computeSubmit" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "computing";
  } else if (
    label.previous === "computeReturn" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "syncing data from compute environment";
  } else if (
    label.previous === "pullPath" &&
    label.previousComplete === true &&
    label.status !== true
  ) {
    return "finishing up";
  }
}
