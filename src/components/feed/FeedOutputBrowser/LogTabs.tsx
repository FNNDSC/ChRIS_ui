import React from "react";
import { Tabs, Tab, TabTitleText, TabTitleIcon } from "@patternfly/react-core";
import { TerminalIcon, AtomIcon } from "@patternfly/react-icons";

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
                <AtomIcon />
              </TabTitleIcon>
              <TabTitleText>JSON Viewer</TabTitleText>
            </>
          }
        ></Tab>
        <Tab
          eventKey={1}
          title={
            <>
              <TabTitleIcon>
                <TerminalIcon />
              </TabTitleIcon>
              <TabTitleText>Terminal</TabTitleText>
            </>
          }
        ></Tab>
      </Tabs>
    </>
  );
};

export default LogTabs;
