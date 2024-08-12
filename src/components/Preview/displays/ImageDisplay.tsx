import React from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const url = fileItem.url
    ? fileItem.url
    : fileItem.blob
      ? window.URL.createObjectURL(new Blob([fileItem.blob]))
      : "";
  return (
    <img
      id={props.fileItem.file ? props.fileItem.file.data.fname : ""}
      src={url}
      alt=""
    />
  );
};

const ImageDisplayMemoed = React.memo(ImageDisplay);

export default ImageDisplayMemoed;
