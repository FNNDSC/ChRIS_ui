import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import { IFileBlob } from "../../../../api/models/file-viewer.model";

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("AUTH_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

type AllProps = {
  fileItem: IFileBlob;
};

const NiftiDisplay = (props: AllProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { fileItem } = props;

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob, file } = fileItem;
    const element = containerRef.current;
    if (!!element) {
      cornerstone.enable(element);
      if (blob && file) {
        const fileArray = file.data.fname.split("/");
        const fileName = fileArray[fileArray.length - 1];
        const imageIdObject = ImageId.fromURL(`nifti:${file.url}${fileName}`);
        cornerstone.loadAndCacheImage(imageIdObject.url).then((image: any) => {
          cornerstone.displayImage(element, image);
          const numberOfSlices = cornerstone.metaData.get(
            "multiFrameModule",
            imageIdObject.url
          ).numberOfFrames;
          const timeSlices = cornerstone.metaData.get(
            "functional",
            imageIdObject.url
          );
          console.log(numberOfSlices, timeSlices);
        });
      }
    }
  }, []);

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);
  return (
    <div className="ami-viewer">
      <div ref={containerRef} id="container">
        <canvas className="cornerstone-canvas" />
      </div>
    </div>
  );
};

export default NiftiDisplay;
