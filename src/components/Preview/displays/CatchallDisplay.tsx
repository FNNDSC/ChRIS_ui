import { memo } from "react";
import { Alert } from "antd";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const CatchallDisplay: React.FunctionComponent<AllProps> = (
  props: AllProps,
) => {
  const noPreviewMessage = () => {
    const { fileItem } = props;
    const ext = fileItem.fileType ? fileItem.fileType : "";

    return (
      <Alert
        type="info"
        description={`No preview available for the filetype ${ext}`}
      />
    );
  };
  return noPreviewMessage();
};

const MemoedCatchAllDisplay = memo(CatchallDisplay);

export default MemoedCatchAllDisplay;
