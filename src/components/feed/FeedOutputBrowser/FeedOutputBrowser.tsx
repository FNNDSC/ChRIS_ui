import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";
import { PluginInstance } from "@fnndsc/chrisapi";
import {
  Title,
  Split,
  SplitItem,
  Button,
  Spinner,
} from "@patternfly/react-core";
import {
  FolderOpenIcon,
  FolderCloseIcon,
  DownloadIcon,
} from "@patternfly/react-icons";
import { getPluginName, getPluginDisplayName } from "./utils";
import {
  setSelectedFile,
  toggleViewerMode,
} from "../../../store/explorer/actions";
import { IUITreeNode } from "../../../api/models/file-explorer.model";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { ApplicationState } from "../../../store/root/applicationState";
import FileBrowser from "./FileBrowser";
import PluginStatus from "./PluginStatus";
import PluginViewerModal from "./PluginViewerModal";
import {
  getPluginFilesRequest,
  stopPolling,
} from "../../../store/plugin/actions";
import { FeedOutputBrowserProps } from "./types";
import { createTreeFromFiles } from "./utils";
import "./FeedOutputBrowser.scss";

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  plugins,
  pluginFiles,
  pluginStatus,
  pluginLog,
  selected,
  handlePluginSelect,
  getPluginFilesRequest,
  setSelectedFile,
  stopPolling,
  viewerMode,
  toggleViewerMode,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (selected) {
      getPluginFilesRequest(selected);
    }
    return () => {
      stopPolling();
    };
  }, [stopPolling, selected, getPluginFilesRequest]);

  const pluginName = selected && getPluginName(selected);
  const pluginDisplayName = selected && getPluginDisplayName(selected);
  const selectedFiles =
    pluginFiles && selected && pluginFiles[selected.data.id as number];
  const tree = selected && createTreeFromFiles(selected, selectedFiles);

  const generateSideItem = (plugin: PluginInstance): React.ReactNode => {
    const { id } = plugin.data;
    const name = getPluginName(plugin);
    const isSelected = selected && selected.data.id === id;
    const icon = isSelected ? <FolderOpenIcon /> : <FolderCloseIcon />;
    const className = isSelected ? "selected" : undefined;

    const handleSidebarItemClick = (plugin: PluginInstance) => {
      handlePluginSelect(plugin);
    };

    return (
      <li
        className={className}
        key={id}
        onClick={() => handleSidebarItemClick(plugin)}
      >
        {icon}
        {name}
      </li>
    );
  };

  const downloadAllClick = async () => {
    if (!selected) return;
    const files = pluginFiles && pluginFiles[selected.data.id as number];

    const zip = new JSZip();
    if (files) {
      for (const file of files) {
        const fileBlob = await file.getFileBlob();
        zip.file(file.data.fname, fileBlob);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const filename = `${getPluginName(selected)}.zip`;
    FileViewerModel.downloadFile(blob, filename);
  };

  const handleFileBrowserOpen = (file: IUITreeNode, folder: IUITreeNode) => {
    setPluginModalOpen(true);
    setSelectedFile(file, folder);
  };

  const handleFileViewerOpen = (file: IUITreeNode, folder: IUITreeNode) => {
    setPluginModalOpen(true);
    setSelectedFile(file, folder);
    toggleViewerMode(!viewerMode);
  };

  const handlePluginModalClose = () => {
    setPluginModalOpen(false);
  };

  return (
    <div className="feed-output-browser">
      <header className="header-top">Output Browser</header>
      <Split>
        <SplitItem>
          <ul className="sidebar">
            {plugins ? (
              plugins
                .sort((a: PluginInstance, b: PluginInstance) => {
                  return a.data.id - b.data.id;
                })
                .map(generateSideItem)
            ) : (
              <Spinner size="md" />
            )}
          </ul>
        </SplitItem>
        <SplitItem isFilled>
          <div className="file-browser-header">
            <div>
              <Title headingLevel="h1" size="2xl" className="plugin-name">
                {pluginDisplayName}
              </Title>
              <span className="plugin-id">
                ID: {selected && selected.data.id}
              </span>
            </div>
            {selectedFiles && (
              <div className="files-info">
                {selectedFiles.length} files
                <Button
                  className="download-all-button"
                  variant="secondary"
                  onClick={downloadAllClick}
                >
                  <DownloadIcon />
                  Download All
                </Button>
              </div>
            )}
          </div>
          {selected &&
          selected.data.status === "finishedSuccessfully" &&
          tree ? (
            <FileBrowser
              pluginName={pluginName}
              root={tree}
              key={selected.data.id}
              handleFileBrowserToggle={handleFileBrowserOpen}
              handleFileViewerToggle={handleFileViewerOpen}
            />
          ) : selected?.data.status === "finishedSuccessfully" && !tree ? (
            <Spinner size="md" />
          ) : (
            <PluginStatus pluginStatus={pluginStatus} pluginLog={pluginLog} />
          )}
        </SplitItem>
      </Split>
      <PluginViewerModal
        isModalOpen={pluginModalOpen}
        handleModalToggle={handlePluginModalClose}
      />
    </div>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginFiles: state.plugin.pluginFiles,
  pluginStatus: state.plugin.pluginStatus,
  pluginLog: state.plugin.pluginLog,
  viewerMode: state.explorer.viewerMode,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesRequest: (selected: PluginInstance) =>
    dispatch(getPluginFilesRequest(selected)),
  setSelectedFile: (file: IUITreeNode, folder: IUITreeNode) =>
    dispatch(setSelectedFile(file, folder)),
  toggleViewerMode: (isViewerOpened: boolean) =>
    dispatch(toggleViewerMode(isViewerOpened)),
  stopPolling: () => dispatch(stopPolling()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedOutputBrowser);
