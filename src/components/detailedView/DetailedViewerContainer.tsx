import React from "react";
import { useTypedSelector } from "../../store/hooks";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { FileBrowserViewer } from "./displays";
import "./Viewer.scss";
import { ExplorerMode } from "../../store/explorer/types";
import DicomViewerContainer from "./displays/DicomViewer";
import XtkViewer from "./displays/XtkViewer/XtkViewer";

const OutputViewerContainer = () => {
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const { mode } = useTypedSelector((state) => state.explorer);
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  if (!selectedPlugin || !pluginFiles) {
    return <Alert variant="info" title="Empty Result Set" className="empty" />;
  } else {
    const buildTabs = () => {
      const explorerModeMap = {
        [ExplorerMode.SwiftFileBrowser]: (
          <Tab title="Swift Browser" eventKey={0} key={0}>
            <FileBrowserViewer />
          </Tab>
        ),
        [ExplorerMode.DicomViewer]: (
          <Tab title="Image Viewer" eventKey={0} key={1}>
            <DicomViewerContainer />
          </Tab>
        ),
        [ExplorerMode.XtkViewer]: (
          <Tab title="XTK Viewer" eventKey={0} key={2}>
            <XtkViewer />
          </Tab>
        ),
      };

      return [explorerModeMap[mode]];
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
        <div className="pf-u-px-lg">
          {
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              {tabs}
            </Tabs>
          }
        </div>
      </div>
    );
  }
};

export default OutputViewerContainer;
