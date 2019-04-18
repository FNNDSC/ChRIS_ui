import React, { createRef } from "react";
import { IFileState } from "../../../api/models/file-viewer.model";

type AllProps = {
  file: IFileState;
};

const ImageDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
 //  const imageRef = createRef<HTMLDivElement>();
  const { file } = props;
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
