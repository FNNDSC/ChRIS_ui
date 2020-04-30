import * as React from "react";

import { IGalleryItem } from "../../../api/models/gallery.model";
import { DownloadIcon } from "@patternfly/react-icons";
import { Alert, Button } from "@patternfly/react-core";
import FileViewerModel from "../../../api/models/file-viewer.model";
type AllProps = {
  galleryItem: IGalleryItem;
};
// Description: No preview message available for this file type
const CatchallDisplay: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const noPreviewMessage = () => {
    const { galleryItem } = props;

    const ext = galleryItem.fileType ? galleryItem.fileType : "";
    const alertText = (
      <React.Fragment>
        <label>
          <b>File Name:</b> {galleryItem.blobName}
        </label>
        <br></br>
        <label>
          <b>File Type:</b> {ext}
        </label>
        <Button
          variant="primary"
          className="float-right"
          onClick={() =>
            galleryItem.blobName &&
            FileViewerModel.downloadFile(galleryItem.blob, galleryItem.blobName)
          }
        >
          <DownloadIcon /> Download
        </Button>
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
  };
  return noPreviewMessage();
};

export default React.memo(CatchallDisplay);
