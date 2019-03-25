import * as React from "react";
import imgPlaceholder from "../../assets/images/view-dicom-image-ph.png";
import brainImgPlaceholder from "../../assets/images/heatmap-example-135.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
};

const DicomViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="dicom-viewer  pf-u-px-lg">
      {/* Note: this iframe will be removed once the ami viewer is implemented - remove in .env.local by adding a REACT_APP_LOCAL_ENV = true  */}
      {!!!process.env.REACT_APP_LOCAL_ENV ? (
        <iframe
          src="http://fnndsc.childrens.harvard.edu/rev/viewer/?year=00&month=00&example=01"
          height={window.innerHeight}
          width="100%"
        />
      ) : (
        <img src={brainImgPlaceholder} alt="placeholder for DICOM Images" />
      )}
    </div>
  );
};

export default React.memo(DicomViewer);
