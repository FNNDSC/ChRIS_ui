import React, { useState } from "react";
import { Tabs, Tab, TabTitleText } from "@patternfly/react-core";
import PipelineDocs from "../../../components/pipelines/PipelineDocs";
import PipelinesFeed from "../../../components/pipelines/PipelinesFeed";

const PipelineNav = () => {
  const [activeTabKey, setActiveTabKey] = useState<React.ReactText>(0);

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: React.ReactText
  ) => {
    setActiveTabKey(eventKey);
  };

  return (
    <div>
      <Tabs
        activeKey={activeTabKey}
        onSelect={(event, eventKey) => handleTabClick(event, eventKey)}
        isFilled
      >
        <Tab eventKey={0} title={<TabTitleText>Pipelines</TabTitleText>}>
          <PipelinesFeed />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Pipeline Docs</TabTitleText>}>
          <PipelineDocs/>
        </Tab>
      </Tabs>
    </div>
  );
};

export default PipelineNav;
