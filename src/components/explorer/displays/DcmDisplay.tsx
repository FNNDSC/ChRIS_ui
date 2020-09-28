import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import DcmImage from "../../dicomViewer/DcmImage";
import { IGalleryItem } from "../../../api/models/gallery.model";

type AllProps = {
  fileItem: IFileBlob;
  galleryItems: IGalleryItem[];
};

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { fileItem } = props;
  const fileBlob: IFileBlob = {
    blob: fileItem.blob,
    fileType: fileItem.fileType || "dcm",
  };

  return (
    <div className="dcm-display">
      <DcmImage file={fileBlob} />
    </div>
  );
};

export default DcmDisplay;
