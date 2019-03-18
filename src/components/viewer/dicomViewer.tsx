import * as React from "react";
// import imgPlaceholder from "../../assets/images/view-dicom-image-ph.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
};

const DicomViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="dicom-viewer  pf-u-px-lg">
      {/* Note: this iframe will be removed once the ami viewer is implemented */}
       <iframe
          src="http://fnndsc.childrens.harvard.edu/rev/viewer/?year=00&month=00&example=01"
          height={window.innerHeight}
          width="100%"
        /> 
      {/* <img src={imgPlaceholder} alt="placeholder for DICOM Images" />*/}
      {/* <small><b>Note:</b> Underlying images are normative and do <b>not</b> represent the original scans the falues being compared came from.</small> */}
    </div>
  );
};

export default React.memo(DicomViewer);
