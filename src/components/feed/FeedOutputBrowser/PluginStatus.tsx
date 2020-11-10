import React from "react";
import { Steps } from "antd";
import { Spinner, GridItem, Grid,Title,Alert } from "@patternfly/react-core";
import ReactJSON from "react-json-view";
import "antd/dist/antd.css";
import "../../explorer/file-detail.scss";
import { displayDescription } from "./utils";
import {
  PluginStatusProps,
  Logs,
LogStatus
} from "./types";
import { isEmpty } from "lodash";
import classNames from "classnames";
import LogTabs from "./LogTabs";
import LogTerminal from './LogTerminal'


const { Step } = Steps;

type ComputeLog = {
  d_ret?: {
    l_logs?: string[];
  };
};

const PluginStatus: React.FC<PluginStatusProps> = ({
  pluginStatus,
  pluginLog,
}) => {
  const [logs, setLogs] = React.useState({});
  const [activeKey, setActiveKey] = React.useState<React.ReactText>(0);
  const [computeLog,setComputeLog]=React.useState<string>("")
  const [step,setCurrentStep]=React.useState('')

  const src: Logs | undefined = pluginLog;
  let pluginLogs: LogStatus = {};

  if (src && src.info) {
    pluginLogs["pushPath"] = src.info.pushPath.return;
    pluginLogs["computeSubmit"] = src.info.compute.submit;
    pluginLogs["computeReturn"] = src.info.compute.return;
    pluginLogs["pullPath"] = src.info.pullPath.return;
    pluginLogs["swiftPut"] = src.info.swiftPut.return;
  }

  React.useEffect(()=>{
    let computeLog: string | undefined = "";
    if (step === "computeReturn" && activeKey === 1) {
      let currentLog: ComputeLog = pluginLogs[step];
      if(currentLog){
      computeLog =
       currentLog.d_ret && currentLog.d_ret.l_logs && currentLog.d_ret.l_logs[0];
      }
      if (computeLog) setComputeLog(computeLog);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pluginLog,step])

  const handleClick = (step: string, title: string) => {
    let currentLog = pluginLogs[step];
    let computeLog:string|undefined=''
    if (step === "computeReturn") {
      let currentLog: ComputeLog = pluginLogs[step];
      computeLog=currentLog.d_ret &&
          currentLog.d_ret.l_logs &&
          currentLog.d_ret.l_logs[0]
      if(computeLog)
      setComputeLog(computeLog) 
    }
    else{
      setComputeLog('')
    }
    if(currentLog){
      setLogs(currentLog)
    }
    setCurrentStep(step)

  };

  const handleActiveKey = (activeKey: React.ReactText) => {
    setActiveKey(activeKey);
  };

  if (pluginStatus && pluginStatus?.length > 0) {
    return (
      <Grid hasGutter className="file-browser">
        <GridItem className="file-browser__steps" span={4} rowSpan={12}> 
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
        <GridItem className="file-browser__plugin-status" span={8} rowSpan={12}>
          <LogTabs activeKey={activeKey} setActiveKey={handleActiveKey} />
          {activeKey === 0 && !isEmpty(logs) ? (
            <div className="viewer-display">
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
            </div>
          ) : activeKey === 1 && !computeLog ? (
            <div className="viewer-display">
              <Alert
                variant="info"
                title="The terminal feature is only available for the compute logs"
              />
            </div>
          ) : activeKey === 1 && computeLog ? (
            <div className="viewer-display">
              <LogTerminal text={computeLog} />
            </div>
          ) : (
            <div className="viewer-display">
              <Alert
                style={{
                  marginTop: "1rem",
                }}
                variant="info"
                title="Logs are not available at the moment. Please click on the step to fetch logs in a few minutes"
              />
            </div>
          )}
        </GridItem>
      </Grid>
    );
  }
  return (
    <Grid>
      <GridItem className="file-browser__spinner-title" span={12} rowSpan={2}>
        <Title
          style={{
            marginBottom: "1rem",
          }}
          headingLevel="h4"
        >
          Plugin Execution Status
        </Title>
      </GridItem>
      <GridItem className="file-browser__spinner-status" span={12} rowSpan={12}>
        <Spinner size="lg" />
      </GridItem>
    </Grid>
  );
};

/**
 * Utility Functions
 */

export default PluginStatus;
