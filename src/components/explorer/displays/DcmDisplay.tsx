import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import * as dicomParser from "dicom-parser";
import { DcmImageState, DcmImageProps } from "../../dicomViewer/types";
import "../../dicomViewer/amiViewer.scss";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneTools.init({
  globalToolSyncEnabled: true,
});
cornerstoneTools.external.Hammer = Hammer;

function getInitialState() {
  return {
    viewport: cornerstone.getDefaultViewport(null, undefined),
    stack: {
      imageId: [],
      currentImageIdIndex: 0,
    },
  };
}

const DcmDisplay: React.FC<DcmImageProps> = (props: DcmImageProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dcmImageState, setDcmImageState] = React.useState<DcmImageState>(
    getInitialState
  );

  const { file, blob } = props.fileItem;
  const { stack } = dcmImageState;

  const onWindowResize = () => {
    const element = containerRef.current;
    if (element) cornerstone.resize(element);
  };

  const onImageRendered = React.useCallback(() => {
    const element = containerRef.current;
    if (element) {
      const viewport = cornerstone.getViewport(element);
      setDcmImageState((dcmImageState) => {
        return {
          ...dcmImageState,
          viewport,
        };
      });
    }
  }, []);

  const initAmi = React.useCallback(
    (file: Blob) => {
      const element = containerRef.current;
      let imageId = "";
      if (!!element) {
        cornerstone.enable(element);
        imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        cornerstone.loadImage(imageId).then((image: any) => {
          cornerstone.displayImage(element, image);
          element.addEventListener("cornerstoneimagerendered", onImageRendered);
        });
        window.addEventListener("resize", onWindowResize);
      }
    },
    [ onImageRendered]
  );

  React.useEffect(() => {
    if (!!blob) {
      initAmi(blob);
    }
  }, [file?.data.fname, initAmi, blob]);

  return (
    <div className="ami-viewer">
      <div ref={containerRef} id="container">
        <canvas className="cornerstone-canvas" />
      </div>
    </div>
  );
};

export default DcmDisplay;
