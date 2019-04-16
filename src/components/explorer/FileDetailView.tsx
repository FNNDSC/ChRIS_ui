import * as React from "react";
import {  Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import {
  IUITreeNode,
  getFileExtension
} from "../../api/models/file-explorer";
import { IFileState } from "../../api/models/file-viewer";
import FeedFileModel from "../../api/models/feed-file.model";

import GalleryArrows from "./components/GalleryArrows";
import GalleryToolbar from "./components/GalleryToolbar";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay
} from "./displays/index";
import { LoadingComponent } from "..";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};

class FileDetailView extends React.Component<AllProps, IFileState> {
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
    fileType: ""
  };

    render() {
    const { selectedFile } = this.props;
    const fileTypeViewer = () => {
      if (selectedFile.module !== this.state.blobName) {
        this.fetchData();
        return <LoadingComponent/>;
      } else {
        return (<React.Fragment>
          {this.renderHeader()}
          <div className="gallery-wrapper" >
            {this.renderContent()}
            <GalleryArrows param={"tbd"} />
            <GalleryToolbar param={"tbd"} />
          </div>
        </React.Fragment>)
      }
    };
    return <div>{!!this.state.blob && fileTypeViewer()}</div>;
  }

  // Decription: Render file header with download button
  renderHeader(classname?: string) {
    const { selectedFile } = this.props;
    return (
      <div className={`header-panel ${classname}`}>
        {this.renderDownloadButton()}
        <h1>
          File Preview: <b>{selectedFile.module}</b>
        </h1>
      </div>
    );
  }

  // Decription: Render the individual viewers by filetypd
  renderContent() {
    const { selectedFile, downloadFileNode } = this.props;
    switch (this.state.fileType) {
      case "stats":
      case "txt":
      case "html":
      case "csv":
      case "ctab":
        return <IframeDisplay file={this.state} />
      case "json":
        return <JsonDisplay file={this.state} />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <ImageDisplay file={this.state} />
      case "dcm":
        return <DcmDisplay file={this.state} />
      default:
        return <CatchallDisplay file={this.state} downloadFile={() => { downloadFileNode(selectedFile); }} />
    }
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { selectedFile } = this.props;
    FeedFileModel.getFileBlob(selectedFile.file.file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(selectedFile.module);
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self._isMounted && _self.setState({ blob: result.data, blobName: selectedFile.module, fileType, blobText });
        });
        reader.readAsText(result.data);
      }
    });
  }

  renderDownloadButton = () => {
    const { selectedFile, downloadFileNode } = this.props;
    return (
      <Button
        variant="primary"
        className="float-right"
        onClick={() => {
          downloadFileNode(selectedFile);
        }}
      >
        <DownloadIcon /> Download
      </Button>
    );
  };

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
