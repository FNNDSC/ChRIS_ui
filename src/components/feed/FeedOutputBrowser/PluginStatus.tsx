import React from "react";
import { Steps } from "antd";
import { Spinner, Split, SplitItem } from "@patternfly/react-core";
import ReactJSON from "react-json-view";
import "antd/dist/antd.css";
import "../../explorer/file-detail.scss";
import { getStatusLabels, displayDescription } from "./utils";
import {
  PluginStatusProps,
  PluginStatusLabels,
  Logs,
  LogStatus,
} from "./types";

import classNames from "classnames";

const { Step } = Steps;

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  pluginLog,
}) => {
  const [logs, setLogs] = React.useState({});
  const [logTitle, setLogTitle] = React.useState("");

  const pluginStatusLabels: PluginStatusLabels =
    pluginStatus && JSON.parse(pluginStatus);

  const src: Logs | undefined = pluginLog;
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
        <Split hasGutter={true} className="file-browser__flex1">
          <SplitItem 
          style={{marginTop:"20px"}}      
          className="file-browser__flex__item1">
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
                    collapsed={false}
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
