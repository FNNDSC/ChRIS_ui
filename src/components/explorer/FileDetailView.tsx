import * as React from "react";
import { Alert, Button } from "@patternfly/react-core";
import { IUITreeNode, getFileExtension } from "../../api/models/file-explorer";

import { DownloadIcon, OutlinedFileImageIcon } from "@patternfly/react-icons";

import "./file-detail.scss";
type AllProps = {
  active: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};

class FileDetailView extends React.Component<AllProps> {
  render() {
    return  this.noPreviewMessage(); // this.displayTextInIframe();
  }

  // Description: Return an iframe to display the content
  displayTextInIframe = () => {
    const { active, downloadFileNode } = this.props;
    const file_resource: string = active.file.file_resource; // + `/token=${window.sessionStorage.getItem("AUTH_TOKEN")}&output=embed`;
    return !!file_resource ? <iframe src={`${file_resource}`} height={window.innerHeight} width="100%" /> : this.noPreviewMessage();
  }
  // Description: No preview message available for this file type
  noPreviewMessage = () => {
    const { active, downloadFileNode } = this.props;
    const ext = getFileExtension(active);
    const alertText = (
      <React.Fragment>
        <label>
          <b>File Name:</b> {active.module}
        </label>
        <label>
          <b>File Type:</b> {ext}
        </label>
        <Button
          variant="primary"
          className="float-right"
          onClick={() => {
            downloadFileNode(active);
          }}
        >
          <DownloadIcon /> Download
        </Button>
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
}

export default React.memo(FileDetailView);
