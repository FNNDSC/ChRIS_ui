import React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const url = !!fileItem.blob
    ? window.URL.createObjectURL(new Blob([fileItem.blob]))
    : "";
  return (
    <div className="image-block">
      <img
        id={props.fileItem.file ? props.fileItem.file.fname : ""}
        src={url}
        alt=""
      />
    </div>
  );
};

export default React.memo(ImageDisplay);
