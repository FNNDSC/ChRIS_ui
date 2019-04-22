import React, { createRef } from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  file: IFileBlob;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  console.log(file);
  const url = !!file.blob
    ? window.URL.createObjectURL(new Blob([file.blob]))
    : "";
  return (
    <div className="image-block">
        <img id="test" src={url} />
    </div>
  );
};

export default React.memo(ImageDisplay);
