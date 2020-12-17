import React from "react";

import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const PdfDisplay: React.FC<AllProps> = ({ fileItem }) => {
  const url = !!fileItem.blob
    ? window.URL.createObjectURL(
        new Blob([fileItem.blob], { type: "application/pdf" })
      )
    : "";
  return (
    <iframe
      key={fileItem.file && fileItem.file.fname}
      src={url}
      width="100%"
      style={{
        height: "60vh",
      }}
      title="Gallery"
    />
  );
};

export default PdfDisplay;
