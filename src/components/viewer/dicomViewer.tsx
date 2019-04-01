import * as React from "react";
import brainImg2DPlaceholder from "../../assets/images/image-ph-frame118.png";
import brainImg3dPlaceholder from "../../assets/images/fs3Dsample.png";
import brainImgZScorePlaceholder from "../../assets/images/z-score-frame121.png";

type AllProps = {
  pluginType?: string;
};

// Description: Will be replaced with a DCM Fyle viewer
const DicomViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const imageSrc =(props.pluginType === "DicomViewer_3D") ? brainImg3dPlaceholder :
  (props.pluginType === "DicomViewer_2D") ? brainImg2DPlaceholder : brainImgZScorePlaceholder;
  return (
    <div className="plugin-viewer  pf-u-px-lg">
      <img src={imageSrc} alt="placeholder for Viewer Images" />
    </div>
  );
};

export default React.memo(DicomViewer);
