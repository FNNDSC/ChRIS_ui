import React from 'react';
import { Steps } from "antd";
import { GridItem, Grid, Title, Spinner } from "@patternfly/react-core";
import {Spin, Alert} from 'antd' 
import ReactJSON from "react-json-view";
import "../../explorer/file-detail.scss";
import { displayDescription } from "./utils";
import { PluginStatusProps, ComputeLog} from "./types";
import { isEmpty } from "lodash";
import classNames from "classnames";
import LogTabs from "./LogTabs";
import LogTerminal from "./LogTerminal";



const { Step } = Steps;

const PluginStatus:React.FC<PluginStatusProps>=({
  pluginStatus,
  pluginLog
})=>{
  const [activeKey, setActiveKey] = React.useState<React.ReactText>(0)
  const [currentLog,setCurrentLog]=React.useState({})

  const handleClick=(step:string)=>{
   
    if(step==='computeReturn'){
      const log= pluginLog?.info?.compute?.return || {}
      setCurrentLog(log)
    }
    else if(step==='computeSubmit'){
      const log=pluginLog?.info?.compute?.submit || {}
      setCurrentLog(log)
    }
    else {
      const log=pluginLog?.info[step]?.return|| {}
      setCurrentLog(log)
    }
  }


  const computeLog:ComputeLog|undefined=pluginLog?.info?.compute?.return
  const typedLog:string[] | undefined=computeLog?.d_ret?.l_logs
  

  const handleActiveKey = (activeKey: React.ReactText) => {
    setActiveKey(activeKey);
  };

  if(pluginStatus && pluginStatus.length>0){
    return (
      <Grid hasGutter className="file-browser">
        <GridItem className="file-browser__steps" span={4} rowSpan={12}>
          <Steps direction="vertical">
            {pluginStatus.map((label: any) => {
              const currentDescription = displayDescription(label);
              let showIcon: boolean = false;

              if (currentDescription) {
                showIcon =
                  currentDescription ===
                    "Transmitting data to compute environment" ||
                  currentDescription === "Computing" ||
                  currentDescription === "Finishing up" ||
                  currentDescription === "Setting compute environment" ||
                  currentDescription ===
                    "Syncing data from compute environment";
              }
              return (
                <Step
                  onClick={() => {
                    handleClick(label.step);
                  }}
                  description={currentDescription}
                  className={classNames("file-browser__step")}
                  key={label.id}
                  title={
                    <span
                      className="file-browser__step-title"
                      onClick={() => {
                        handleClick(label.step);
                      }}
                    >
                      {label.title}
                    </span>
                  }
                  icon={showIcon && <Spinner size="lg" />}
                  status={
                    label.error === true
                      ? "error"
                      : label.status === true
                      ? "finish"
                      : undefined
                  }
                />
              );
            })}
          </Steps>
        </GridItem>
        <GridItem className="file-browser__plugin-status" span={8} rowSpan={12}>
          <LogTabs
            className="file-browser__plugin-status--tabs"
            activeKey={activeKey}
            setActiveKey={handleActiveKey}
          />
          {activeKey === 0 && pluginLog && !isEmpty(pluginLog.info) ? (
            <div
            className="file-browser__plugin-status--json"
            >
              <ReactJSON
                name={false}
                displayDataTypes={false}
                displayObjectSize={false}
                src={currentLog}
                indentWidth={4}
                collapsed={false}
              />
            </div>
          ) : (
            activeKey === 1 && (
              <LogTerminal
                className="file-browser__plugin-status--terminal"
                text={
                  typedLog && typedLog[0]
                    ? typedLog[0]
                    : "The compute logs aren't available right now. Please wait as they are being fetched."
                }
              />
            )
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
      <GridItem className="file-browser__spinner-status" span={4} rowSpan={12}>
        <Spin
        tip='Loading....'>
          <Alert message="Retrieving Plugin's execution"
          type='info'
          />
        </Spin>
      </GridItem>
    </Grid>
  );


}

export default PluginStatus;