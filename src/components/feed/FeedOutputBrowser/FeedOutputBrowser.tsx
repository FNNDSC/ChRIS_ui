import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";

import {
  Grid,
  GridItem,
  Spinner,  
  Skeleton
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
import { getPluginFilesRequest,} from "../../../store/feed/actions";
import { IUITreeNode } from "../../../api/models/file-explorer.model";
import FileViewerModel from "../../../api/models/file-viewer.model";
import { ApplicationState } from "../../../store/root/applicationState";
import { createTreeFromFiles, getPluginName } from "./utils";
import {
  PluginInstancePayload,
  ResourcePayload
} from "../../../store/feed/types";
import {getSelectedInstanceResource, getSelectedFiles} from '../../../store/feed/selector'
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import {isEmpty} from 'lodash'
import "./FeedOutputBrowser.scss";



export interface FeedOutputBrowserProps {
  pluginInstances: PluginInstancePayload;
  selected?: PluginInstance;
  pluginFiles: FeedFile[];
  viewerMode?: boolean;
  pluginInstanceResource: ResourcePayload
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
  const { data: plugins, loading, error } = pluginInstances;
  const pluginStatus= pluginInstanceResource && pluginInstanceResource.pluginStatus
  const pluginLog=pluginInstanceResource && pluginInstanceResource.pluginLog
  
  React.useEffect(() => {
    if (selected) {
      getPluginFilesRequest(selected);
    }
  }, [selected]);

  if(!selected || isEmpty(pluginInstances) || loading){
    return (
      <Grid hasGutter className="feed-output-browser">
        <GridItem
          className="feed-output-browser__sidebar "
          rowSpan={12}
          span={2}
        >
          <ul>
            <Skeleton
              shape="square"
              width="30%"
              screenreaderText="Loading Sidebar"
            />
          </ul>
        </GridItem>
        <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
          <Grid>
            <GridItem span={12} rowSpan={12}>
              <Skeleton
                height="75%"
                width="75%"
                screenreaderText="Fetching Plugin Resources"
              />
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    );
  }
  else {
   
    const pluginName = selected && selected.data && getPluginName(selected)
    const tree = createTreeFromFiles(selected, pluginFiles);
    const generateSideItem = (plugin: PluginInstance): React.ReactNode => {
      const id = plugin && plugin.data.id;
      const name = getPluginName(plugin);
      const isSelected =
        selected && selected.data && selected.data.id === id;
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
      if (pluginFiles) {
        for (const file of pluginFiles) {
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
        <Grid hasGutter className="feed-output-browser ">
          <GridItem
            className="feed-output-browser__sidebar"
            rowSpan={12}
            span={2}
          >
            <ul className="sidebar">
              {plugins && plugins.length > 0
                ? plugins
                    .sort((a: PluginInstance, b: PluginInstance) => {
                      return a?.data?.id - b?.data?.id;
                    })
                    .map(generateSideItem)
                : new Array(4).map((_, i) => (
                    <Skeleton width="25%" screenreaderText="Fetching Plugins" />
                  ))}
            </ul>
          </GridItem>

          <GridItem
            className="feed-output-browser__main"
            span={10}
            rowSpan={12}
          >
            <Grid>
              <GridItem span={12} rowSpan={12}>
                {selected &&
                selected.data.status === "finishedSuccessfully" &&
                tree ? (
                  <FileBrowser
                    pluginLog={pluginLog}
                    selectedFiles={pluginFiles}
                    pluginName={pluginName}
                    root={tree}
                    key={selected.data.id}
                    handleFileBrowserToggle={handleFileBrowserOpen}
                    handleFileViewerToggle={handleFileViewerOpen}
                    downloadAllClick={downloadAllClick}
                  />
                ) : selected.data.status === "finishedSuccessfully" && !tree ? (
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
  }
  
};

const mapStateToProps = (state: ApplicationState) => ({
  pluginInstanceResource: getSelectedInstanceResource(state),
  selected: state.feed.selectedPlugin,
  pluginFiles: getSelectedFiles(state),
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
