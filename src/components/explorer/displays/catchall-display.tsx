import * as React from "react";
import { IFileState, getFileExtension } from "../../../api/models/file-explorer";
import { DownloadIcon } from "@patternfly/react-icons";
import { Alert, Button } from "@patternfly/react-core";

type AllProps = {
 file: IFileState;
 downloadFile: () => void;
};
// Description: No preview message available for this file type
const CatchallDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const noPreviewMessage = () => {
        const { file, downloadFile } = props;
        const ext = getFileExtension(file.blobName);
        const alertText = (
        <React.Fragment>
            <label>
              <b>File Name:</b> {file.blobName}
            </label>
            <label>
              <b>File Type:</b> {ext}
            </label>
            <Button
              variant="primary"
              className="float-right"
              onClick={() => {
                downloadFile();
              }}
            ><DownloadIcon /> Download</Button>
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
    return noPreviewMessage();
}

export default React.memo(CatchallDisplay);
