import * as React from "react";
import { DownloadIcon } from "@patternfly/react-icons";
import { Alert, Button } from "@patternfly/react-core";
import FileViewerModel, {
  IFileBlob,
} from "../../../../api/models/file-viewer.model";
type AllProps = {
  fileItem: IFileBlob;
};

const CatchallDisplay: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  const noPreviewMessage = () => {
    const { fileItem } = props;
    const ext = fileItem.fileType ? fileItem.fileType : "";
    const alertText = (
      <React.Fragment>
        <label></label>
        <br></br>
        <label>
          <b>File Type:</b> {ext}
        </label>
        <Button
          variant="primary"
          className="float-right"
          onClick={() =>
            fileItem.file &&
            fileItem.file.data.fname &&
            FileViewerModel.downloadFile(
              fileItem.blob,
              fileItem.file.data.fname
            )
          }
        >
          <DownloadIcon /> Download
        </Button>
      </React.Fragment>
    );
    return (
      <Alert variant="info" title="No preview available for large files">
        {alertText}
      </Alert>
    );
  };
  return noPreviewMessage();
};

export default React.memo(CatchallDisplay);
