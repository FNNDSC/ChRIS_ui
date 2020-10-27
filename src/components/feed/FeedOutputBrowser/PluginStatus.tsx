import React from "react";
import { Steps } from "antd";
import { Spinner, GridItem, Grid,Title } from "@patternfly/react-core";
import ReactJSON from "react-json-view";
import "antd/dist/antd.css";
import "../../explorer/file-detail.scss";
import { displayDescription } from "./utils";
import {
  PluginStatusProps,
  Logs,
  LogStatus,
} from "./types";
import { isEmpty } from "lodash";
import classNames from "classnames";

const { Step } = Steps;

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  pluginLog,
}) => {
  const [logs, setLogs] = React.useState({});
  const [logTitle, setLogTitle] = React.useState("");
 

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
    
  };

  if (pluginStatus && pluginStatus?.length > 0) {
    return (
        <Grid hasGutter className='file-browser'>
          <GridItem span={12} rowSpan={2}>
            <Title headingLevel="h2">Plugin Execution Status</Title>
          </GridItem>
          <GridItem className="file-browser__steps" span={6} rowSpan={10}>
            <Steps direction="vertical">
              {pluginStatus.map((label: any) => {
                const currentDescription = displayDescription(label);
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
                    status={
                      label.error
                        ? "error"
                        : label.status === true
                        ? "finish"
                        : "wait"
                    }
                  />
                );
              })}
            </Steps>
          </GridItem>
          <GridItem
            className="file-browser__plugin-status"
            span={6}
            rowSpan={12}
          >
            <div className="header-panel">
              <h1>
                {Object.keys(logs).length > 0 &&
                  `Showing logs for ${logTitle} :`}
              </h1>
            </div>
            <div>
              {logs && (
                <div className="viewer-display">
                  <ReactJSON
                    name={false}
                    displayDataTypes={false}
                    style={{
                      fontSize: "16px",
                    }}
                    displayObjectSize={false}
                    src={logs}
                    collapsed={false}
                    collapseStringsAfterLength={15}
                    indentWidth={0}
                  />
                </div>
              )}
            </div>
          </GridItem>
        </Grid>
     
    );
  }
  return <Spinner size="lg" />;
};

/**
 * Utility Functions
 */

export default PluginStatus;
