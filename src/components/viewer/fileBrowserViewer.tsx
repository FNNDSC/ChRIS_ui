import * as React from "react";

type AllProps = {
  data: any[];
};

const FileBrowserViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <div className="pf-u-p-lg">
      <h1>File Browser section</h1>
    </div>
  );
};

export default React.memo(FileBrowserViewer);
