import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import DcmImage from "../../dicomViewer/DcmImage";
import { IGalleryItem } from "../../../api/models/gallery.model";

type AllProps = { file: IGalleryItem };

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const fileBlob: IFileBlob = {
    blob: file.blob,
    blobName: file.fileName,
    blobText: "",
    fileType: file.fileType || "dcm"
  }
  return (
    <div className="dcm-display">
      <DcmImage file={fileBlob} />
    </div>
  );
};


export default DcmDisplay;
