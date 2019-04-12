import * as React from "react";
import {ChevronLeftIcon, ChevronRightIcon } from "@patternfly/react-icons"
import { IFileState } from "../../../api/models/file-explorer";
import DcmImage from "../../dicomViewer/DcmImage";

type AllProps = {
  file: IFileState;
};

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  // Description: navigation arrows on the side - will likely move out of this component
  const Arrows = () => {
    return (
      <div className="arrows">
        <a className="prev" onClick={() => handlePlay(-1)}
        ><span className="pf-u-screen-reader">Previous</span><ChevronLeftIcon color="white"/></a>
        <a className="next" onClick={() => handlePlay(1)}><span className="pf-u-screen-reader">Next</span><ChevronRightIcon color="white" /></a>
      </div>
    )
  }
  // Description: toolbar at bottom - will likely move out of this component
  const Toolbar = () => {
    return (
      <div className="toolbar"> HI, I am Toolbar</div>
    )
  }
  return (
    <div className="dcm-display">
      <DcmImage file={file} />
      {/* <Arrows />
      <Toolbar /> */}
    </div>
  );
};

// Description: will move images to previous or next in the tree
const handlePlay = (indexOffset: number)=>{
  console.log("handlePlay", indexOffset);
}

export default React.memo(DcmDisplay);
