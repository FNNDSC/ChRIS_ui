import React from "react";
import { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const url = fileItem.url;
  return (
    <img
      id={props.fileItem.file ? props.fileItem.file.data.fname : ""}
      src={url}
      alt="png or jpeg display"
    />
  );
};

export default ImageDisplay;
