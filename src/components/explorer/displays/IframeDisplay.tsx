import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import catchallDisplay from "./CatchallDisplay";

type AllProps = {
  file: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const url = (!!file.blob) ? window.URL.createObjectURL(new Blob([file.blob])) : "";
  return (
    <div className="default-display">
      <iframe
        key={file.blobName}
        src={url}
        height={window.innerHeight}
        width="100%"
      />
    </div>
  );
};

export default React.memo(IframeDisplay);
