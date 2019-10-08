import * as React from "react";
import { IGalleryItem } from "../../../api/models/gallery.model";
type AllProps = {
  galleryItem: IGalleryItem;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { galleryItem } = props;
  const url = (!!galleryItem.blob) ? window.URL.createObjectURL(new Blob([galleryItem.blob])) : "";
  return (
    <div className="default-display">
      <iframe
        key={galleryItem.fileName}
        src={url}
        height={window.innerHeight}
        width="100%"
        title="Gallery"
      />
    </div>
  );
};

export default React.memo(IframeDisplay);
