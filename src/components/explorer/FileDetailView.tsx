import * as React from "react";
import { Alert, Button } from "@patternfly/react-core";
import { IUITreeNode, getFileExtension } from "../../api/models/file-explorer";
import FeedFileModel from "../../api/models/feed-file.model";
import { DownloadIcon } from "@patternfly/react-icons";
import { LoadingComponent } from "..";

import "./file-detail.scss";
type AllProps = {
  active: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};

class FileDetailView extends React.Component<
  AllProps,
  { blob?: Blob; blobName: string }
> {
  constructor(props: AllProps) {
    super(props);
    this.fetchData();
  }
  state = {
    blob: undefined,
    blobName: ""
  };

  fetchData() {
    const { active } = this.props;
    FeedFileModel.getFileBlob(active.file.file_resource).then((result: any) => {
      this.setState({ blob: result.data, blobName: active.module });
    });
  }
  render() {
    const { active } = this.props;
    const fileTypeViewer = () => {
      if (active.module !== this.state.blobName) {
        this.fetchData();
      } else {
        switch (getFileExtension(active)) {
          case "stats":
          case "json":
            return this.displayTextInIframe(this.state.blob);
          // dcm viewer to be done
          default:
            return this.noPreviewMessage();
        }
      }
    };
    return <div>{!!this.state.blob && fileTypeViewer()}</div>;
  }
  // Description: Return an iframe to display the content
  displayTextInIframe = (blob?: Blob) => {
    const { active } = this.props;
    if (!!blob) {
      const url = window.URL.createObjectURL(new Blob([blob]));
      return (
        <div>
          <div className="header-panel">
            {this.renderDownloadButton()}
            <h1>
              File Preview: <b>{active.module}</b>
            </h1>
          </div>
          <iframe
            className="file-iframe"
            key={this.state.blobName}
            src={url}
            height={window.innerHeight}
            width="100%"
          />
        </div>
      );
    } else {
      return <LoadingComponent />;
    }
  }

  // Description: No preview message available for this file type
  noPreviewMessage = () => {
    const { active } = this.props;
    const ext = getFileExtension(active);
    const alertText = (
      <React.Fragment>
        <label>
          <b>File Name:</b> {active.module}
        </label>
        <label>
          <b>File Type:</b> {ext}
        </label>
        {this.renderDownloadButton()}
      </React.Fragment>
    );
    return (
      <div className="file-detail">
        <Alert
          variant="info"
          title="No preview available for file:"
          children={alertText}
        />
      </div>
    );
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
  }
}

export default FileDetailView;
