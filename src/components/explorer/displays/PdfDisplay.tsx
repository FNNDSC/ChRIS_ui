import React from "react";

import { IFileBlob } from "../../../api/models/file-viewer.model";

type AllProps = {
  fileItem: IFileBlob;
};

const PdfDisplay: React.FC<AllProps> = ({ fileItem }: AllProps) => {
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
      height="100%"
      title="Gallery"
    />
  );
};

export default PdfDisplay;
