import React from "react";
import { useTypedSelector } from "../../store/hooks";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { FileBrowserViewer } from "./displays";
import "./Viewer.scss";

const OutputViewerContainer = () => {
  const { pluginFiles, selectedPlugin } = useTypedSelector(
    (state) => state.feed
  );

  const [activeTabKey, setActiveTabKey] = React.useState(0);

  if (!selectedPlugin || !pluginFiles) {
   return <Alert variant="info" title="Empty Result Set" className="empty" />;
  } else {
    const buildTabs = () => {
      const tabs = [];
      tabs.push(
        <Tab title="Swift Browser" eventKey={0} key={0}>
          <FileBrowserViewer />
        </Tab>
      );
      return tabs;
    };

    const tabs = buildTabs();
    const handleTabClick = (
      event: React.MouseEvent<HTMLElement, MouseEvent>,
      tabIndex: React.ReactText
    ) => {
      setActiveTabKey(tabIndex as number);
    };
    return (
      <div className="output-viewer">
        {
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
            {tabs}
          </Tabs>
        }
      </div>
    );
  }
};

export default OutputViewerContainer;
