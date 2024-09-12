import { memo } from "react";
import { Alert } from "../../Antd";
import { getFileExtension, type IFileBlob } from "../../../api/model";

type AllProps = {
  selectedFile?: IFileBlob;
};

const CatchallDisplay: React.FunctionComponent<AllProps> = (
  props: AllProps,
) => {
  const noPreviewMessage = () => {
    const { selectedFile } = props;
    const extension = getFileExtension(selectedFile?.data.fname);

    return (
      <Alert
        type="info"
        description={`No preview available for the filetype ${extension}`}
      />
    );
  };
  return noPreviewMessage();
};

const MemoedCatchAllDisplay = memo(CatchallDisplay);

export default MemoedCatchAllDisplay;
