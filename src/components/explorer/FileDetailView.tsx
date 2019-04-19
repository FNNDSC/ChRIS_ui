import * as React from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { getFileExtension, IUITreeNode } from "../../api/models/file-explorer.model";
import { IFileState } from "../../api/models/file-viewer.model";
import FeedFileModel from "../../api/models/feed-file.model";
import { downloadFile, fileViewerMap } from "../../api/models/file-viewer.model";
import { LoadingComponent } from "..";
import ViewerDisplay from "./displays/ViewerDisplay";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
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
        return <LoadingComponent color="#ddd" />;
      } else {
        return (
          this.renderContent()
        );
      }
    };
    return (
      fileTypeViewer()
      // <GalleryWrapper downloadFile={() => this.downloadFileNode()} >
      //    {fileTypeViewer()}
      // </GalleryWrapper>
    )
  }

  // Decription: Render the individual viewers by filetype ***** working
  renderContent() {
    const viewerName = fileViewerMap[this.state.fileType];
    return <ViewerDisplay tag={viewerName} file={this.state} />
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { selectedFile } = this.props;
    const fileUrl = selectedFile.file.file_resource,
      fileName = selectedFile.module,
      fileType = getFileExtension(fileName);
    FeedFileModel.getFileBlob(fileUrl).then((result: any) => {
      const _self = this;
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self._isMounted && _self.setState({ blob: result.data, blobName: fileName, fileType, blobText });
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
