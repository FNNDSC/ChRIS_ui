import React from "react";
import { IGalleryItem } from "../../../api/models/gallery.model";
type AllProps = {
  galleryItem: IGalleryItem;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { galleryItem } = props;
  const url = !!galleryItem.blob
    ? window.URL.createObjectURL(new Blob([galleryItem.blob]))
    : "";
  return (
    <div className="image-block">
        <img id={props.galleryItem.fileName} src={url} alt="" />
    </div>
  );
};

export default React.memo(ImageDisplay);
