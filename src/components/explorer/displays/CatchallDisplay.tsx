import * as React from "react";
import { getFileExtension } from "../../../api/models/file-explorer.model";
import { IGalleryItem } from "../../../api/models/gallery.model";
import { DownloadIcon } from "@patternfly/react-icons";
import { Alert, Button } from "@patternfly/react-core";
import FileViewerModel from "../../../api/models/file-viewer.model";
type AllProps = {
  galleryItem: IGalleryItem;
};
// Description: No preview message available for this file type
const CatchallDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
    const noPreviewMessage = () => {
        const { galleryItem } = props;
        const ext = getFileExtension(galleryItem.fileName);
        const alertText = (
        <React.Fragment>
            <label>
              <b>File Name:</b> {galleryItem.fileName}
            </label>
            <label>
              <b>File Type:</b> {ext}
            </label>
           <Button
              variant="primary"
              className="float-right"
              onClick={ () => FileViewerModel.downloadFile(galleryItem.blob, galleryItem.fileName) }
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
