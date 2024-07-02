import React from "react";
import { IFileBlob } from "../../../api/model";

type AllProps = {
  fileItem: IFileBlob;
};

const PdfDisplay: React.FC<AllProps> = ({ fileItem }: AllProps) => {
  const url = fileItem.url;
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
