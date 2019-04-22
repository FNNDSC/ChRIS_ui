import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import DcmImage from "../../dicomViewer/DcmImage";

type AllProps = { file: IFileBlob };

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  return (
    <div className="dcm-display">
      <DcmImage file={file} />
    </div>
  );
};


export default React.memo(DcmDisplay);
