import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Grid, GridItem, Alert } from "@patternfly/react-core";
import { ApplicationState } from "../../../store/root/applicationState";
import {setExplorerRequest,setSelectedFile, setSelectedFolder} from "../../../store/explorer/actions";
import { IExplorerState } from "../../../store/explorer/types";
import { IFeedFile } from "../../../api/models/feed-file.model";
import { IPluginItem } from "../../../api/models/pluginInstance.model";
import { IUITreeNode } from "../../../api/models/file-explorer.model";
import { downloadFile } from "../../../api/models/file-viewer.model";
import GalleryModel from "../../../api/models/gallery.model";
import FileExplorer from "../../explorer/FileExplorer";
import FileTableView from "../../explorer/FileTableView";
import FileDetailView from "../../explorer/FileDetailView";
import FeedFileModel from "../../../api/models/feed-file.model";

interface IPropsFromDispatch {
  setExplorerRequest: typeof setExplorerRequest;
  setSelectedFile: typeof setSelectedFile;
  setSelectedFolder: typeof setSelectedFolder;
}

type AllProps = {
  files: IFeedFile[];
  selected: IPluginItem;
} & IExplorerState &
  IPropsFromDispatch;

class FileBrowserViewer extends React.Component<AllProps> {
  componentDidMount() {
    const { files, selected, setExplorerRequest } = this.props;
    setExplorerRequest(files, selected);
  }

  // Description: handle active node and render FileDetailView
  setActiveNode = (node: IUITreeNode) => {
    const { explorer, setSelectedFile, setSelectedFolder } = this.props;
    if (!!node.leaf && node.leaf) {
      const gallery = new GalleryModel(node, explorer);
      setSelectedFile(node, gallery);
    } else {
      setSelectedFolder(node);
    }
  };

  render() {
    const { explorer, galleryItem, selectedFile, selectedFolder } = this.props;
    return (
      // Note: check to see if explorer children have been init.
      (!!explorer && !!explorer.children) && (
        <div className="pf-u-px-lg">
          <Grid>
            <GridItem className="pf-u-p-sm" sm={12} md={3}>
              {
                <FileExplorer
                  explorer={explorer}
                  selectedNode={selectedFile || selectedFolder}
                  onClickNode={this.setActiveNode}
                />
              }
            </GridItem>
            <GridItem className="pf-u-py-sm pf-u-px-xl" sm={12} md={9}>
              {!!selectedFolder ? (
                <FileTableView
                  selectedFolder={selectedFolder}
                  onClickNode={this.setActiveNode}
                  downloadFileNode={this.handleFileDownload}
                />) :
                !!galleryItem ? (
                  <FileDetailView galleryItem={galleryItem} />) :
                  (
                    <Alert
                      variant="info"
                      title="Please select a file or folder from the file explorer"
                      className="empty"
                    />
                  )}
            </GridItem>
          </Grid>
        </div>
      )
    );
  }

  // Description: handle file download first get file blob
  handleFileDownload(node: IUITreeNode) {
    const downloadUrl = node.file.file_resource;
    const _self = this;
    if (!!node.file) {
      FeedFileModel.getFileBlob(downloadUrl)
        .then((result: any) => {
          downloadFile(result.data, node.module);
        })
        .catch((error: any) => console.error("(1) Inside error:", error));
    } else {
      console.error("ERROR DOWNLOADING: download url is not defined");
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setExplorerRequest: (files: IFeedFile[], selected: IPluginItem) => dispatch(setExplorerRequest(files, selected)),
  setSelectedFile: (node: IUITreeNode, galleryModel: GalleryModel) => dispatch(setSelectedFile(node, galleryModel)),
  setSelectedFolder: (node: IUITreeNode) => dispatch(setSelectedFolder(node))
});

const mapStateToProps = ({ explorer }: ApplicationState) => ({
  selectedFile: explorer.selectedFile,
  selectedFolder: explorer.selectedFolder,
  explorer: explorer.explorer,
  galleryItem: explorer.galleryItem
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileBrowserViewer);
