import * as React from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon, ExpandIcon, FilmIcon } from "@patternfly/react-icons";
import {
  getFileExtension,
  IUITreeNode,
} from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";

import { fileViewerMap } from "../../api/models/file-viewer.model";

import { LoadingSpinner } from "..";
import ViewerDisplay from "./displays/ViewerDisplay";
import { isEqual } from "lodash";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  fullScreenMode?: boolean;
  toggleFileBrowser: () => void;
  toggleFileViewer: () => void;
  isDicom?: boolean;
};

class FileDetailView extends React.Component<AllProps, IFileBlob> {
  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.fetchData();
  }
  state = {
    blob: undefined,
    fileType: "",
    file: undefined,
  };

  render() {
    const { selectedFile } = this.props;

    const fileTypeViewer = () => {
      if (!isEqual(selectedFile.file.data, this.state.file)) {
        this.fetchData();
        return <LoadingSpinner color="#ddd" />;
      } else {
        const viewerName = fileViewerMap[this.state.fileType];

        return (
          <>
            {this.renderHeader()}
            <ViewerDisplay tag={viewerName} fileItem={this.state} />
          </>
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

    const fileName = selectedFile.module,
      fileType = getFileExtension(fileName);
    selectedFile.file.getFileBlob().then((result: any) => {
      const _self = this;
      if (!!result) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          _self._isMounted &&
            _self.setState({
              blob: result,
              fileType,
              file: Object.assign({}, selectedFile.file.data),
            });
        });
        reader.readAsText(result);
      }
    });
  }

  renderDownloadButton = () => {
    const { fullScreenMode } = this.props;

    return (
      <div className="float-right">
        {fullScreenMode === true && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileBrowser();
            }}
          >
            <ExpandIcon />
            <span> Maximize</span>
          </Button>
        )}

        {(this.state.fileType === "dcm" ||
          this.state.fileType === "png" ||
          this.state.fileType === "jpg" ||
          this.state.fileType === "jpeg") && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileViewer();
            }}
          >
            <FilmIcon />
            <span> Open Image Viewer</span>
          </Button>
        )}
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
  downloadFileNode = () => {};

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
