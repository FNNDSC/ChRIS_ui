import * as React from "react";
import { IFileState } from "../../../api/models/file-viewer";
import DcmImage from "../../dicomViewer/DcmImage";

type AllProps = { file: IFileState };

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  return (
    <div className="dcm-display">
      <DcmImage file={file} />
    </div>
  );
};


export default React.memo(DcmDisplay);
