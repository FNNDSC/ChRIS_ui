import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
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
import { setSelectedFile } from "../../../store/explorer/actions";
import UITreeNodeModel, {
  IUITreeNode,
} from "../../../api/models/file-explorer.model";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { ApplicationState } from "../../../store/root/applicationState";
import FileBrowser from "../FileBrowser";
import PluginStatus from "./PluginStatus";
import PluginViewerModal from "../../plugin/PluginViewerModal";
import "./FeedOutputBrowser.scss";
import {
  getPluginFilesRequest,
  stopPolling,
} from "../../../store/plugin/actions";

interface FeedOutputBrowserProps {
  selected?: PluginInstance;
  plugins?: PluginInstance[];
  pluginFiles?: { [pluginId: number]: FeedFile[] };
  pluginStatus?: string;
  pluginLog?: {};
  handlePluginSelect: Function;
  setSelectedFile: Function;
  getPluginFilesRequest: (selected: PluginInstance) => void;
  stopPolling: () => void;
}

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
    const className = isSelected ? "selected" : "";

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

  const handlePluginModalOpen = (file: IUITreeNode, folder: IUITreeNode) => {
    setPluginModalOpen(true);
    setSelectedFile(file, folder);
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
            {plugins ? plugins.map(generateSideItem) : <Spinner size="md" />}
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
          {selected && tree ? (
            <FileBrowser
              pluginName={pluginName}
              root={tree}
              key={selected.data.id}
              handleViewerModeToggle={handlePluginModalOpen}
            />
          ) : selected && selected.data.status === "finishedSuccessfully" ? (
            <Spinner size="lg" />
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesRequest: (selected: PluginInstance) =>
    dispatch(getPluginFilesRequest(selected)),
  setSelectedFile: (file: IUITreeNode, folder: IUITreeNode) =>
    dispatch(setSelectedFile(file, folder)),
  stopPolling: () => dispatch(stopPolling()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedOutputBrowser);

/**
 * Utility Function
 */

function createTreeFromFiles(selected: PluginInstance, files?: FeedFile[]) {
  if (!files) return null;

  const model = new UITreeNodeModel(files, selected);
  const tree = model.getTree();
  tree.module = getPluginName(selected);
  return tree;
}
