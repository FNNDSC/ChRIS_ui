import React, { createRef } from "react";
import { IGalleryItem } from "../../../api/models/gallery.model";
type AllProps = {
  file: IGalleryItem;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const url = !!file.blob
    ? window.URL.createObjectURL(new Blob([file.blob]))
    : "";
  return (
    <div className="image-block">
        <img id={props.file.fileName} src={url} />
    </div>
  );
};

export default React.memo(ImageDisplay);
