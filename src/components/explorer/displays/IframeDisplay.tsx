import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
type AllProps = {
  fileItem: IFileBlob;
};

const IframeDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;

  let url = "";

  if (fileItem.fileType === "html") {
    url = !!fileItem.blob
      ? window.URL.createObjectURL(
          new Blob([fileItem.blob], { type: "text/html" })
        )
      : "";
  }else  if (fileItem.fileType === "pdf") {
    url = !!fileItem.blob
      ? window.URL.createObjectURL(
          new Blob([fileItem.blob], { type: "application/pdf" })
        )
      : "";
  } else {
    url = !!fileItem.blob
      ? window.URL.createObjectURL(new Blob([fileItem.blob]))
      : "";
  }

  return (
    <>
      <iframe
        key={fileItem.file && fileItem.file.fname}
        src={url}
        width="100%"
        style={{
          height: "60vh",
        }}
        title="Gallery"
      />
    </>
  );
};

export default React.memo(IframeDisplay);
