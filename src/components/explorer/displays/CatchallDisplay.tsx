import * as React from "react";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import { IGalleryItem } from "../../../api/models/gallery.model";
import { DownloadIcon } from "@patternfly/react-icons";
import { Alert, Button } from "@patternfly/react-core";
import FileViewerModel from "../../../api/models/file-viewer.model";
type AllProps = {
 file: IGalleryItem;
};
// Description: No preview message available for this file type
const CatchallDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const noPreviewMessage = () => {
        const { file } = props;
        const ext = getFileExtension(file.fileName);
        const alertText = (
        <React.Fragment>
            <label>
              <b>File Name:</b> {file.fileName}
            </label>
            <label>
              <b>File Type:</b> {ext}
            </label>
           <Button
              variant="primary"
              className="float-right"
              onClick={ () => FileViewerModel.downloadFile(file.blob, file.fileName) }
            ><DownloadIcon /> Download</Button>
        </React.Fragment>
      );
        return (
        <div className="catchall">
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
