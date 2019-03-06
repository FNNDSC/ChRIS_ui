import * as React from "react";

type AllProps = {
  data: any[];
};

const DicomViewer: React.FunctionComponent<AllProps> = (
  props: AllProps
) => {
  return (
    <div className="pf-u-p-lg">
      <h1>DICOM Viewer section</h1>
    </div>
  );
};

export default React.memo(DicomViewer);
