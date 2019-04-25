import * as React from "react";
import { IGalleryItem } from "../../../api/models/gallery.model";
type AllProps = {
  file: IGalleryItem;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const url = (!!file.blob) ? window.URL.createObjectURL(new Blob([file.blob])) : "";
  return (
    <div className="default-display">
      <iframe
        key={file.fileName}
        src={url}
        height={window.innerHeight}
        width="100%"
      />
    </div>
  );
};

export default React.memo(IframeDisplay);
