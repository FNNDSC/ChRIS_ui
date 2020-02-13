import * as React from "react";
import { FeedFile } from "@fnndsc/chrisapi";
type AllProps = {
  files: FeedFile[];
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
