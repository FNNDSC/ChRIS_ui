import * as React from "react";
import brainImgPlaceholder from "../../assets/images/image-ph-frame118.png";
import brainImg3dPlaceholder from "../../assets/images/fs3Dsample.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
  pluginType?: string;
};

// Description: Will be replaced with a DCM Fyle viewer
const DicomViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="plugin-viewer  pf-u-px-lg">
      <img src={(props.pluginType === "freesurfer_pp") ? brainImg3dPlaceholder : brainImgPlaceholder} alt="placeholder for Viewer Images" />
    </div>
  );
};

export default React.memo(DicomViewer);
