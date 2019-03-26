import * as React from "react";
import imgPlaceholder from "../../assets/images/view-dicom-image-ph.png";
import brainImgPlaceholder from "../../assets/images/heatmap-example-135.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
};

const RevViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="plugin-viewer pf-u-px-lg">
      <iframe
          src="http://fnndsc.childrens.harvard.edu/rev/viewer/?year=00&month=00&example=01"
          height={window.innerHeight}
          width="100%"
        />
    </div>
  );
};

export default React.memo(RevViewer);
