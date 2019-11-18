import * as React from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon, ExpandIcon } from "@patternfly/react-icons";
import {
  getFileExtension,
  IUITreeNode
} from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import ChrisModel from "../../api/models/base.model";
import FileViewerModel, {
  fileViewerMap
} from "../../api/models/file-viewer.model";
import { LoadingSpinner } from "..";
import ViewerDisplay from "./displays/ViewerDisplay";
import _ from "lodash";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  toggleViewerMode: (isViewerMode: boolean) => void;
};

class FileDetailView extends React.Component<AllProps, IFileBlob> {
  _isMounted = false;
  constructor(props: AllProps) {
    super(props);
    this.fetchData();
  }
  componentDidMount() {
    this._isMounted = true;
  }
  state = {
    blob: undefined,
    blobName: "",
    blobText: null,
    fileType: "",
    file: undefined
  };

  render() {
    const { selectedFile } = this.props;

    const fileTypeViewer = () => {
      if (!_.isEqual(selectedFile.file, this.state.file)) {
        this.fetchData();
        return <LoadingSpinner color="#ddd" />;
      } else {
        const viewerName = fileViewerMap[this.state.fileType];

        return (
          <div className={viewerName.toLowerCase()}>
            {this.renderHeader()}
            <ViewerDisplay tag={viewerName} galleryItem={this.state} />
          </div>
        );
      }
    };
    return fileTypeViewer();
  }

  // Decription: Render the Header
  renderHeader() {
    const { selectedFile } = this.props;
    return (
      <div className="header-panel">
        {this.renderDownloadButton()}
        <h1>
          File Preview: <b>{selectedFile.module}</b>
        </h1>
      </div>
    );
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { selectedFile } = this.props;

    const fileUrl = selectedFile.file.file_resource,
      fileName = selectedFile.module,
      fileType = getFileExtension(fileName);
    ChrisModel.getFileBlob(fileUrl).then((result: any) => {
      const _self = this;
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self._isMounted &&
            _self.setState({
              blob: result.data,
              blobName: fileName,
              fileType,
              blobText,
              file: Object.assign({}, selectedFile.file)
            });
        });
        reader.readAsText(result.data);
      }
    });
  }

  renderDownloadButton = () => {
    return (
      <div className="float-right">
        <Button
          variant="link"
          onClick={() => {
            this.props.toggleViewerMode(false);
          }}
        >
          <ExpandIcon /> open in viewer
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            this.downloadFileNode();
          }}
        >
          <DownloadIcon />
        </Button>
      </div>
    );
  };

  // Download Curren File blob
  downloadFileNode = () => {
    return FileViewerModel.downloadFile(this.state.blob, this.state.blobName);
  };

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
