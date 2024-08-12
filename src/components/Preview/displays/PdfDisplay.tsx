import type React from "react";
import type { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const PdfDisplay: React.FC<AllProps> = ({ fileItem }: AllProps) => {
  const url = fileItem.url
    ? fileItem.url
    : fileItem.blob
      ? window.URL.createObjectURL(
          new Blob([fileItem.blob], { type: "application/pdf" }),
        )
      : "";
  return (
    <div className="iframe-container">
      <iframe
        key={fileItem.file?.data.fname}
        src={url}
        width="100%"
        height="100%"
        title="Gallery"
      />
    </div>
  );
};

export default PdfDisplay;
