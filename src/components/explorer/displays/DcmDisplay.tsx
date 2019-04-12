import * as React from "react";
import { IFileState } from "../../../api/models/file-explorer";
import DcmImage from "../../dicomViewer/DcmImage";

type AllProps = {
  file: IFileState;
};

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const Arrows = () => {
    return (
      <div className="arrows"> HI, I am Arrows</div>
    )
  }
  const Toolbar = () => {
    return (
      <div className="toolbar"> HI, I am Toolbar</div>
    )
  }
  return (
    <div className="dcm-display">
      <DcmImage file={file} />
      <Arrows />
      <Toolbar />
    </div>
  );
};



export default React.memo(DcmDisplay);
