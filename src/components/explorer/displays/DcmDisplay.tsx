import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import DcmImageSeries from "../../dicomViewer/DcmImageSeries";
import DcmImage from "../../dicomViewer/DcmImage";
import { IGalleryItem } from "../../../api/models/gallery.model";
import { LoadingComponent } from "../..";

type AllProps = {
  file: IGalleryItem;
  galleryItems: IGalleryItem[];
};

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { file } = props;
  const fileBlob: IFileBlob = {
    blob: file.blob,
    blobName: file.fileName,
    blobText: "",
    fileType: file.fileType || "dcm"
  };
 
  return (
    <div className="dcm-display">
      {!!props.galleryItems ? (
        props.galleryItems.length ?
          <DcmImageSeries {...props} /> :
          <LoadingComponent />
      ) : (
        <DcmImage file={fileBlob} />
      )}
    </div>
  );
};

export default DcmDisplay;
