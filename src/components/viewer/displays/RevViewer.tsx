import * as React from "react";
import { IFeedFile } from "../../../api/models/feed-file.model";
type AllProps = {
  files: IFeedFile[];
};

const RevViewer: React.FunctionComponent<AllProps> = (props: AllProps) => {
  return (
    <div className="plugin-viewer pf-u-px-lg">
      <iframe
          src="http://fnndsc.childrens.harvard.edu/rev/viewer/?year=03&month=11&example=01"
          height={window.innerHeight}
          width="100%"
          title="Viewer"
        />
    </div>
  );
};

export default React.memo(RevViewer);
