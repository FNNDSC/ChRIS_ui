import * as React from "react";
import { Alert, Button } from "@patternfly/react-core";
import {
  IUITreeNode,
  IFileState,
  getFileExtension
} from "../../api/models/file-explorer";
import FeedFileModel from "../../api/models/feed-file.model";
import { DownloadIcon, ResourcesAlmostFullIcon } from "@patternfly/react-icons";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay
} from "./displays/index";

import "./file-detail.scss";
type AllProps = {
  active: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};

class FileDetailView extends React.Component<AllProps, IFileState> {
  constructor(props: AllProps) {
    super(props);
    this.fetchData();
  }
  state = {
    blob: undefined,
    blobName: "",
    blobText: null,
    fileType: ""
  };

  render() {
    const { active } = this.props;
    const fileTypeViewer = () => {
      if (active.module !== this.state.blobName) {
        this.fetchData();
      } else {
        return this.renderContent();
      }
    };
    return <div>{!!this.state.blob && fileTypeViewer()}</div>;
  }

  renderHeader(classname?: string) {
    const { active } = this.props;
    return (
      <div className={`header-panel ${classname}`}>
        {this.renderDownloadButton()}
        <h1>
          File Preview: <b>{active.module}</b>
        </h1>
      </div>
    );
  }
  renderContent() {
    const { active, downloadFileNode } = this.props;
    switch (this.state.fileType) {
      case "stats":
      case "txt":
      case "html":
      case "csv":
      case "ctab":
        return (
          <React.Fragment>
            {this.renderHeader("sm")}
            <IframeDisplay file={this.state} />
          </React.Fragment>
        );
      case "json":
        return (
          <React.Fragment>
            {this.renderHeader()}
            <JsonDisplay file={this.state} />;
          </React.Fragment>
        );
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return (
          <React.Fragment>
            {this.renderHeader()}
            <ImageDisplay file={this.state} />
          </React.Fragment>
        );
      case "dcm":
        return (
          <CatchallDisplay
            file={this.state}
            downloadFile={() => {
              downloadFileNode(active);
            }}
          />
        ); // TEMP: will build the dcm viewer
      default:
        return (
          <CatchallDisplay
            file={this.state}
            downloadFile={() => {
              downloadFileNode(active);
            }}
          />
        ); // this.noPreviewMessage(); //
    }
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { active } = this.props;
    FeedFileModel.getFileBlob(active.file.file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(active.module);
      this.setState({ blob: result.data, blobName: active.module, fileType });
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          const blobText = e.target.result;
          _self.setState({ blobText });
        });
        reader.readAsText(result.data);
      }
    });
  }

  renderDownloadButton = () => {
    const { active, downloadFileNode } = this.props;
    return (
      <Button
        variant="primary"
        className="float-right"
        onClick={() => {
          downloadFileNode(active);
        }}
      >
        <DownloadIcon /> Download
      </Button>
    );
  };
}

export default FileDetailView;
