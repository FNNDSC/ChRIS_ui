import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";

import {
  Grid,
  GridItem,
  Spinner,  
} from "@patternfly/react-core";
import {
  FolderOpenIcon,
  FolderCloseIcon,
} from "@patternfly/react-icons";
import FileBrowser from "./FileBrowser";
import PluginViewerModal from "./PluginViewerModal";
import PluginStatus from './PluginStatus'
import {
  setSelectedFile,
  toggleViewerMode,
} from "../../../store/explorer/actions";
import { getPluginFilesRequest, stopFetchingPluginResources } from "../../../store/feed/actions";
import { IUITreeNode } from "../../../api/models/file-explorer.model";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { ApplicationState } from "../../../store/root/applicationState";
import { createTreeFromFiles, getPluginName } from "./utils";
import {
  PluginInstanceResourcePayload,
  FilesPayload,
  PluginInstancePayload,
} from "../../../store/feed/types";
import { PluginInstance } from "@fnndsc/chrisapi";
import "./FeedOutputBrowser.scss";



export interface FeedOutputBrowserProps {
  pluginInstances: PluginInstancePayload;
  selected?: PluginInstance;
  pluginFiles: FilesPayload;
  viewerMode?: boolean;
  pluginInstanceResource: PluginInstanceResourcePayload;
  handlePluginSelect: Function;
  setSelectedFile: Function;
  getPluginFilesRequest: (selected: PluginInstance) => void;
  toggleViewerMode: (isViewerOpened: boolean) => void;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  pluginInstances,
  pluginFiles,
  pluginInstanceResource,
  selected,
  handlePluginSelect,
  setSelectedFile,
  viewerMode,
  toggleViewerMode,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);
  const { data: plugins } = pluginInstances;
  

  React.useEffect(() => {
    if (selected) {
      getPluginFilesRequest(selected);
    }
  }, [selected]);



  const pluginName = selected && selected.data && getPluginName(selected);
  const id = selected?.data?.id;
  const selectedFiles = id && pluginFiles[id] ? pluginFiles[id].files: undefined;
  const pluginStatus= id && pluginInstanceResource[id] ? pluginInstanceResource[id].pluginStatus : undefined
  const pluginLog=id && pluginInstanceResource[id] ? pluginInstanceResource[id].pluginLog : undefined
  const tree =
    selected && selectedFiles && createTreeFromFiles(selected, selectedFiles);

  const generateSideItem = (plugin: PluginInstance): React.ReactNode => {
    const id  = plugin && plugin.data?.id;
    const name = getPluginName(plugin);
    const isSelected = selected && selected?.data && selected?.data?.id === id;
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
  
    const zip = new JSZip();
    if (selectedFiles) {
      for (const file of selectedFiles) {
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
    setPluginModalOpen(!pluginModalOpen);
  };

  return (
    <>
      <Grid hasGutter className="feed-output-browser">
        <GridItem
          className="feed-output-browser__sidebar"
          rowSpan={12}
          span={2}
        >
          <ul className="sidebar">
            {plugins ? (
              plugins
                .sort((a: PluginInstance, b: PluginInstance) => {
                  return a?.data?.id - b?.data?.id;
                })
                .map(generateSideItem)
            ) : (
              <Spinner size="md" />
            )}
          </ul>
        </GridItem>

        <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
          <Grid>
            <GridItem span={12} rowSpan={12}>
              {selected &&
              selected.data?.status === "finishedSuccessfully" &&
              tree &&
              selectedFiles ? (
                <FileBrowser
                  selectedFiles={selectedFiles}
                  pluginName={pluginName}
                  root={tree}
                  key={selected.data.id}
                  handleFileBrowserToggle={handleFileBrowserOpen}
                  handleFileViewerToggle={handleFileViewerOpen}
                  downloadAllClick={downloadAllClick}
                />
              ) : selected?.data.status === "finishedSuccessfully" && !tree ? (
                <GridItem span={12} rowSpan={12}>
                  <div>
                    <Spinner size="md" />
                  </div>
                </GridItem>
              ) : (
                <div>
                  <GridItem span={12} rowSpan={12}>
                    <PluginStatus
                      selected={selected}
                      pluginStatus={pluginStatus}
                      pluginLog={pluginLog}
                    />
                  </GridItem>
                </div>
              )}
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
      <PluginViewerModal
        isModalOpen={pluginModalOpen}
        handleModalToggle={handlePluginModalClose}
      />
    </>
  );
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: state.feed.pluginInstanceResource,
  selected: state.feed.selectedPlugin,
  pluginFiles: state.feed.pluginFiles,
  pluginInstances: state.feed.pluginInstances,
  viewerMode: state.explorer.viewerMode,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  getPluginFilesRequest: (selected: PluginInstance) =>
    dispatch(getPluginFilesRequest(selected)),
  setSelectedFile: (file: IUITreeNode, folder: IUITreeNode) =>
    dispatch(setSelectedFile(file, folder)),
  toggleViewerMode: (isViewerOpened: boolean) =>
    dispatch(toggleViewerMode(isViewerOpened)),
  
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedOutputBrowser);
