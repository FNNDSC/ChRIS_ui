import * as React from "react";
import imgPlaceholder from "../../assets/images/view-dicom-image-ph.png";

type AllProps = {
  data: any[];
};

const DicomViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <div className="dicom-viewer">
      <img src={imgPlaceholder} alt="placeholder for DICOM Images" />
      <small><b>Note:</b> Underlying images are normative and do <b>not</b> represent the original scans the falues being compared came from.</small>
    </div>
  );
};

export default React.memo(DicomViewer);
