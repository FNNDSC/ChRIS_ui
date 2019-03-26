import * as React from "react";
import imgPlaceholder from "../../assets/images/view-dicom-image-ph.png";
import brainImgPlaceholder from "../../assets/images/heatmap-example-135.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
};

// Description: Will be replaced with a DCM Fyle viewer
const DicomViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="plugin-viewer  pf-u-px-lg">
      <img src={brainImgPlaceholder} alt="placeholder for Viewer Images" />
    </div>
  );
};

export default React.memo(DicomViewer);
