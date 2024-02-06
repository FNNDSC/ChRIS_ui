import * as React from "react";
import { Alert } from "@patternfly/react-core";
import { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const CatchallDisplay: React.FunctionComponent<AllProps> = (
  props: AllProps,
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
      </React.Fragment>
    );
    return (
      <Alert
        variant="info"
        title={`No preview available for the filetype ${ext}`}
      >
        {alertText}
      </Alert>
    );
  };
  return noPreviewMessage();
};

const MemoedCatchAllDisplay = React.memo(CatchallDisplay);

export default MemoedCatchAllDisplay;
