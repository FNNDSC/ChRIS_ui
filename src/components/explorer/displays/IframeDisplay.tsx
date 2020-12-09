import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
type AllProps = {
  fileItem: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const url = !!fileItem.blob
    ? window.URL.createObjectURL(new Blob([fileItem.blob]))
    : "";

  return (
    <>
      <iframe
        key={fileItem.file && fileItem.file.fname}
        src={url}
        width="100%"
        style={{
          height:'100vh'
        }}
        title="Gallery"
      />
    </>
  );
};

export default React.memo(IframeDisplay);
