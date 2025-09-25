import type { CSSProperties } from "react";
import { getFileExtension, type IFileBlob } from "../../../api/model";
import { Alert } from "../../Antd";

type Props = {
  selectedFile?: IFileBlob;
  isHide?: boolean;
};

export default (props: Props) => {
  const { selectedFile, isHide } = props;
  const extension = getFileExtension(selectedFile?.data?.fname || "");
  const style: CSSProperties = {};
  if (isHide) {
    return <div style={{ display: "none" }}></div>;
  }
  return (
    <Alert
      type="info"
      description={`No preview available for the filetype ${extension}`}
      style={style}
    />
  );
};
