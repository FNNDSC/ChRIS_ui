import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import JSZip from "jszip";
import {
  Grid,
  GridItem,
  Skeleton,
  EmptyState,
  EmptyStateBody,
  Title,
  EmptyStateIcon,
  EmptyStateVariant,
} from "@patternfly/react-core";
import { Spin, Alert } from "antd"; 
import FileBrowser from "./FileBrowser";
import PluginViewerModal from "./PluginViewerModal";
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
  ResourcePayload,
} from "../../../store/feed/types";

import {getSelectedInstanceResource, getSelectedFiles} from '../../../store/feed/selector'
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import {isEmpty} from 'lodash'
import { getFeedTree } from "./data";
import { Tree } from "antd";
import "./FeedOutputBrowser.scss";
import "antd/dist/antd.css";
import { CubeIcon } from "@patternfly/react-icons";
const {DirectoryTree}=Tree;


export interface FeedOutputBrowserProps {
  pluginInstances: PluginInstancePayload;
  selected?: PluginInstance;
  pluginFilesPayload?: {
    files: FeedFile[];
    error: any;
    hasNext: boolean;
  } 
  viewerMode?: boolean;
  pluginInstanceResource: ResourcePayload;
  handlePluginSelect: Function;
  setSelectedFile: Function;
  getPluginFilesRequest: (selected: PluginInstance) => void;
  toggleViewerMode: (isViewerOpened: boolean) => void;
}

const FeedOutputBrowser: React.FC<FeedOutputBrowserProps> = ({
  pluginInstances,
  pluginFilesPayload,
  pluginInstanceResource,
  selected,
  handlePluginSelect,
  setSelectedFile,
  viewerMode,
  toggleViewerMode,
  getPluginFilesRequest,
}) => {
  const [pluginModalOpen, setPluginModalOpen] = React.useState(false);
  const { data: plugins, loading } = pluginInstances;

  React.useEffect(() => {
    if (!pluginFilesPayload && selected) {
      getPluginFilesRequest(selected);
    }
  }, [selected, pluginFilesPayload, getPluginFilesRequest]);

  if (!selected || isEmpty(pluginInstances) || loading) {
    return (
      <Grid hasGutter className="feed-output-browser">
        <GridItem
          className="feed-output-browser__sidebar "
          rowSpan={12}
          span={2}
        >
          <Skeleton
            shape="square"
            width="30%"
            screenreaderText="Loading Sidebar"
          />
        </GridItem>
        <GridItem className="feed-output-browser__main" span={10} rowSpan={12}>
          <Grid>
            <GridItem span={12} rowSpan={12}>
              <Skeleton
                height="100%"
                width="75%"
                screenreaderText="Fetching Plugin Resources"
              />
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    );
  } else {
    const pluginName = selected && selected.data && getPluginName(selected);
    const pluginFiles = pluginFilesPayload && pluginFilesPayload.files;
    const tree = createTreeFromFiles(selected, pluginFiles);

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

    let pluginSidebarTree;
    if (plugins && plugins.length > 0) {
      pluginSidebarTree = getFeedTree(plugins);
    }

    return (
      <>
        <Grid hasGutter className="feed-output-browser ">
          <GridItem
            className="feed-output-browser__sidebar"
            xl={2}
            xlRowSpan={12}
            xl2={2}
            xl2RowSpan={12}
            lg={2}
            lgRowSpan={12}
            md={2}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {pluginSidebarTree && (
              <DirectoryTree
                multiple
                defaultExpandAll
                defaultExpandedKeys={[selected.data.id]}
                treeData={pluginSidebarTree}
                selectedKeys={[selected.data.id]}
                onSelect={(node, selectedNode) => {
                  //@ts-ignore
                  handlePluginSelect(selectedNode.node.item);
                }}
              />
            )}
          </GridItem>
          <GridItem
            className="feed-output-browser__main"
            xl={10}
            xlRowSpan={12}
            xl2={10}
            xl2RowSpan={12}
            lg={10}
            lgRowSpan={12}
            md={10}
            mdRowSpan={12}
            sm={12}
            smRowSpan={12}
          >
            {selected &&
            selected.data.status === "finishedSuccessfully" &&
            tree ? (
              <FileBrowser
                selectedFiles={pluginFiles}
                pluginName={pluginName}
                root={tree}
                key={selected.data.id}
                handleFileBrowserToggle={handleFileBrowserOpen}
                handleFileViewerToggle={handleFileViewerOpen}
                downloadAllClick={downloadAllClick}
              />
            ) : selected.data.status === "cancelled" ||
              selected.data.status === "finishedWithError" ? (
              <EmptyState variant={EmptyStateVariant.large}>
                <EmptyStateIcon icon={CubeIcon} />
                <Title headingLevel="h4" size="lg" />
                <EmptyStateBody>
                  The plugin execution was either cancelled or it finished with
                  error.
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <Spin tip="Loading....">
                <Alert message="Retrieving Plugin's Files" type="info" />
              </Spin>
            )}
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
  pluginFilesPayload: getSelectedFiles(state),
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
