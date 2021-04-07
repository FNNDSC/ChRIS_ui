import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import { DcmImageProps } from "../../../dicomViewer/types";
import { IFileBlob } from "../../../../api/models/file-viewer.model";

cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { fileItem } = props;

  const onWindowResize = () => {
    const element = containerRef.current;
    if (element) cornerstone.resize(element);
  };

  const initAmi = React.useCallback((fileItem: IFileBlob) => {
    const { blob } = fileItem;
    const element = containerRef.current;
    let imageId = "";
    if (!!element) {
      cornerstone.enable(element);
      imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(blob);
      cornerstone.loadImage(imageId).then((image: any) => {
        cornerstone.displayImage(element, image);
      });

      window.addEventListener("resize", onWindowResize);
    }
  }, []);

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);

  return (
    <div className="dcm-preview">
      <div ref={containerRef} id="container">
        <canvas className="cornerstone-canvas" />
      </div>
    </div>
  );
};

export default DcmDisplay;
