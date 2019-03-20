import * as React from "react";
import {
  Alert,
  Button
} from "@patternfly/react-core";
import { IUITreeNode, getFileExtension } from "../../api/models/file-explorer";
import {
  DownloadIcon,
  OutlinedFileImageIcon
} from "@patternfly/react-icons";
import "./file-detail.scss";
type AllProps = {
  active: IUITreeNode;
  downloadFileNode: (node: IUITreeNode) => void;
};

class FileDetailView extends React.Component<AllProps> {
  render() {
    const { active, downloadFileNode } = this.props;
    const ext = getFileExtension(active);

    const alertText = (
      <React.Fragment>
        <label><b>File Name:</b> {active.module}</label>
        <label><b>File Type:</b> {ext}</label> 
        <Button variant="primary" className="float-right"
            onClick={() => {
              downloadFileNode(active);
            }} >
            <DownloadIcon /> Download
          </Button>
        </React.Fragment>
    );
    return (
      <div className="file-detail" >
      <Alert variant="info" title="No preview available for file:" children={alertText} />
      </div>
    );
  }
}

export default React.memo(FileDetailView);
