import * as React from "react";
import { IFileState } from "../../../api/models/file-explorer";
import catchallDisplay from "./catchall-display";

type AllProps = {
  file: IFileState;
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
