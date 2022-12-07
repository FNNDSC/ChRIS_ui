import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import { IFileBlob } from "../../../../api/models/file-viewer.model";
import { Cookies } from "react-cookie";
import { SpinContainer } from "../../../common/loading/LoadingContent";

const cookie = new Cookies();
const user = cookie.get("username");
const token: string = cookie.get(`${user}_token`);

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();

cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + token,
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

const StackScrollMouseWheelTool = cornerstoneTools.StackScrollMouseWheelTool;
cornerstoneTools.addTool(StackScrollMouseWheelTool);

cornerstoneTools.setToolActive("StackScrollMouseWheel", {});

type AllProps = {
  fileItem: IFileBlob;
};

const NiftiDisplay = (props: AllProps) => {
  const [loader, setLoader] = React.useState(false);
  const dicomImageRef = React.useRef<HTMLDivElement>(null);
  const { fileItem } = props;

  const initAmi = React.useCallback(async (fileItem: IFileBlob) => {
    const { blob, file } = fileItem;
    const imageIdArray: string[] = [];
    let niftiSlices = 0;
    setLoader(true);
    if (blob && file) {
      const fileArray = file.data.fname.split("/");
      const fileName = fileArray[fileArray.length - 1];
      const imageIdObject = ImageId.fromURL(`nifti:${file.url}${fileName}`);
      const image = await cornerstone.loadAndCacheImage(imageIdObject.url);
      niftiSlices = cornerstone.metaData.get(
        "multiFrameModule",
        imageIdObject.url
      ).numberOfFrames;

      imageIdArray.push(
        ...Array.from(
          Array(niftiSlices),
          (_, i) =>
            `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
        )
      );

      const element = dicomImageRef.current;
      if (element) {
        cornerstone.enable(element);
        const stack = {
          currentImageIdIndex: 0,
          imageIds: imageIdArray,
        };

        cornerstone.displayImage(element, image);
        cornerstoneTools.addStackStateManager(element, ["stack"]);
        cornerstoneTools.addToolState(element, "stack", stack);
        setLoader(false);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!!fileItem) {
      initAmi(fileItem);
    }
  }, [fileItem, initAmi]);
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "512px",
          color: "#fff",
          position: "relative",
          fontSize: "1rem",
          textShadow: "1px 1px #000000",
        }}
        ref={dicomImageRef}
      >
        {loader ? (
          <SpinContainer title="Loading files into cornerstone" />
        ) : (
          <>
            <div id="dicomImageWebGL"></div>
          </>
        )}
      </div>
    </>
  );
};

export default NiftiDisplay;
