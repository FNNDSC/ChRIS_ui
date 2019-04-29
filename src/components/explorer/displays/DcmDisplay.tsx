import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import DcmImageSeries from "../../dicomViewer/DcmImageSeries";
import DcmImage from "../../dicomViewer/DcmImage";
import { IGalleryItem } from "../../../api/models/gallery.model";
import { LoadingComponent } from "../..";

type AllProps = {
  galleryItem: IGalleryItem;
  galleryItems: IGalleryItem[];
};

const DcmDisplay: React.FunctionComponent<AllProps> = (props: AllProps) => {
  const { galleryItem } = props;
  const fileBlob: IFileBlob = {
    blob: galleryItem.blob,
    blobName: galleryItem.fileName,
    blobText: "",
    fileType: galleryItem.fileType || "dcm"
  };

  return (
    <div className="dcm-display">
      <DcmImage file={fileBlob} />
      {/* {!!props.galleryItems ? (
        props.galleryItems.length ?
          <DcmImageSeries {...props} /> :
          <LoadingComponent />
      ) : (
        <DcmImage file={fileBlob} />
      )} */}
    </div>
  );
};

export default DcmDisplay;
