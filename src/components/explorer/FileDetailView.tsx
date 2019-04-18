import * as React from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { getFileExtension } from "../../api/models/file-explorer.model";
import { IFileState } from "../../api/models/file-viewer.model";
import FeedFileModel from "../../api/models/feed-file.model";
import { downloadFile } from "../../api/models/file-viewer.model";
import { IGalleryItem } from "../../api/models/gallery.model";
import { GalleryWrapper } from "../gallery";
import { LoadingComponent } from "..";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay
} from "./displays/index";

import "./file-detail.scss";


type AllProps = {
  galleryItem: IGalleryItem;
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
    const { galleryItem } = this.props;
    const fileTypeViewer = () => {
      if (galleryItem.file_name !== this.state.blobName) {
        this.fetchData();
        return <LoadingComponent color="#ddd" />;
      } else {
        return (
          this.renderContent()
        );
      }
    };
    return (
      <GalleryWrapper downloadFile={() => this.downloadFileNode()}>
        {fileTypeViewer()}
      </GalleryWrapper>
    )
  }

  // Decription: Render the individual viewers by filetypd
  renderContent() {
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
        return <CatchallDisplay file={this.state} downloadFile={() => { this.downloadFileNode(); }} />
    }
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { galleryItem } = this.props;
    FeedFileModel.getFileBlob(galleryItem.file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(galleryItem.file_name);
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self._isMounted && _self.setState({ blob: result.data, blobName: galleryItem.file_name, fileType, blobText });
        });
        reader.readAsText(result.data);
      }
    });
  }

  renderDownloadButton = () => {
    return (
      <Button
        variant="primary"
        className="float-right"
        onClick={() => {
          this.downloadFileNode();
        }}  >
        <DownloadIcon /> Download
      </Button>
    );
  };

  // Download Curren File blob
  downloadFileNode = () => {
    return downloadFile(this.state.blob, this.state.blobName);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
