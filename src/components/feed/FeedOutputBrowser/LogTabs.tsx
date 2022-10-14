import React from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";
import { VscJson } from "react-icons/vsc";
import { FaTerminal } from "react-icons/fa";

type LogTabsProps = {
  className: string;
  activeKey: React.ReactText;
  setActiveKey: (key: React.ReactText) => void;
};

const LogTabs = (props: LogTabsProps) => {
  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: React.ReactText
  ) => {
    props.setActiveKey(eventKey);
  };

  return (
    <>
      <Tabs
        className={props.className}
        isFilled
        activeKey={props.activeKey}
        onSelect={handleTabClick}
      >
        <Tab
          eventKey={0}
          title={
            <>
              <TabTitleIcon>
                <VscJson />
              </TabTitleIcon>
              <TabTitleText>JSON Viewer</TabTitleText>
            </>
          }
         />
        <Tab
          eventKey={1}
          title={
            <>
              <TabTitleIcon>
                <FaTerminal />
              </TabTitleIcon>
              <TabTitleText>Terminal</TabTitleText>
            </>
          }
         />
      </Tabs>
    </>
  );
};

export default LogTabs;
