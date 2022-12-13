import React from "react";
import { useTypedSelector } from "../../store/hooks";
import { Tabs, Tab, Alert } from "@patternfly/react-core";
import { FileBrowserViewer } from "./displays";
import "./Viewer.scss";
import { ExplorerMode } from "../../store/explorer/types";
import DicomViewerContainer from "./displays/DicomViewer";
import XtkViewer from "./displays/XtkViewer/XtkViewer";
import { ButtonContainer } from "./displays/DicomViewer/utils/helpers";

const OutputViewerContainer = () => {
  const pluginFiles = useTypedSelector((state) => state.resource.pluginFiles);
  const selectedPlugin = useTypedSelector(
    (state) => state.instance.selectedPlugin
  );
  const { mode } = useTypedSelector((state) => state.explorer);
  const [actionState, setActionState] = React.useState<{
    [key: string]: boolean;
  }>({});

  const handleEvents = (action: string) => {
    const currentAction = actionState[action];
    setActionState({
      [action]: !currentAction,
    });
  };

  const handleCloseTagInfoModalState = () => {
    setActionState({});
  };

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
          <Tab
            title={<DicomHeader handleEvents={handleEvents} />}
            eventKey={0}
            key={1}
          >
            <DicomViewerContainer
              handleTagInfoState={handleCloseTagInfoModalState}
              action={actionState}
            />
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
        <Tabs
          className={`dicom-tab_${mode}`}
          activeKey={activeTabKey}
          onSelect={handleTabClick}
        >
          {tabs}
        </Tabs>
      </div>
    );
  }
};

export default OutputViewerContainer;

const DicomHeader = ({
  handleEvents,
}: {
  handleEvents: (action: string) => void;
}) => {
  return (
    <div
      style={{
        marginTop: "1rem",
      }}
    >
      <ButtonContainer action="Zoom" handleEvents={handleEvents} />
      <ButtonContainer action="Pan" handleEvents={handleEvents} />
      <ButtonContainer action="Magnify" handleEvents={handleEvents} />
      <ButtonContainer action="Rotate" handleEvents={handleEvents} />
      <ButtonContainer action="Wwwc" handleEvents={handleEvents} />
      <ButtonContainer action="Reset View" handleEvents={handleEvents} />
      <ButtonContainer action="Length" handleEvents={handleEvents} />
      <ButtonContainer action="Gallery" handleEvents={handleEvents} />
      <ButtonContainer action="TagInfo" handleEvents={handleEvents} />
    </div>
  );
};
