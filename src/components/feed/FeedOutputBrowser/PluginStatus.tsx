import React from 'react';
import { Steps } from "antd";
import { GridItem, Grid, Title } from "@patternfly/react-core";
import {Spin, Alert} from 'antd' 
import ReactJSON from "react-json-view";
import "../../explorer/file-detail.scss";
import { PluginStatusProps, ComputeLog} from "./types";
import { isEmpty } from "lodash";
import LogTabs from "./LogTabs";
import LogTerminal from "./LogTerminal";





const PluginStatus:React.FC<PluginStatusProps>=({
  pluginStatus,
  pluginLog
})=>{
  const [activeKey, setActiveKey] = React.useState<React.ReactText>(0);
  const [currentLog, setCurrentLog] = React.useState({});

  

  const computeLog: ComputeLog | undefined = pluginLog?.info?.compute?.return;
  const typedLog: string[] | undefined = computeLog?.d_ret?.l_logs;

  const handleActiveKey = (activeKey: React.ReactText) => {
    setActiveKey(activeKey);
  };

  if (pluginStatus && pluginStatus.length > 0) {
    return (
      <Grid hasGutter className="file-browser">
        <GridItem className="file-browser__steps" span={4} rowSpan={12}>
         
        </GridItem>
        <GridItem className="file-browser__plugin-status" span={8} rowSpan={12}>
          <LogTabs
            className="file-browser__plugin-status--tabs"
            activeKey={activeKey}
            setActiveKey={handleActiveKey}
          />
          {activeKey === 0 && pluginLog && !isEmpty(pluginLog.info) ? (
            <div className="file-browser__plugin-status--json">
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
        <Spin tip="Loading....">
          <Alert message="Retrieving Plugin's execution" type="info" />
        </Spin>
      </GridItem>
    </Grid>
  );
}

export default PluginStatus;