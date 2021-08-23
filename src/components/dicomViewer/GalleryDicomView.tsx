import React, { useState, useRef, useEffect, useCallback } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as dicomParser from "dicom-parser";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import { Progress, ProgressSize, Button } from "@patternfly/react-core";
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  StepForwardIcon,
  StepBackwardIcon,
  CompressIcon,
  PauseIcon,
  PlayIcon,
} from "@patternfly/react-icons";
import DcmHeader from "./DcmHeader/DcmHeader";
import GalleryModel from "../../api/models/gallery.model";
import { DataNode } from "../../store/explorer/types";
import { useTypedSelector } from "../../store/hooks";
import { isDicom, isNifti } from "./utils";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init({
  globalToolSyncEnabled: true,
});
const { Image } = cornerstone;

type ImageItem = {
  imageId: string;
  image: typeof Image;
};

cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

const GalleryDicomView = (props: { files?: DataNode[] }) => {
  const dicomImageRef = useRef(null);
  const selectedFiles = useTypedSelector(
    (state) => state.explorer.selectedFolder
  );
  const [progress, setProgress] = useState(0);

  const enableTool = () => {
    const WwwcTool = cornerstoneTools.WwwcTool;
    const LengthTool = cornerstoneTools["LengthTool"];
    const PanTool = cornerstoneTools.PanTool;
    const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
    const ZoomTool = cornerstoneTools.ZoomTool;
    const ProbeTool = cornerstoneTools.ProbeTool;
    const EllipticalRoiTool = cornerstoneTools.EllipticalRoiTool;
    const RectangleRoiTool = cornerstoneTools.RectangleRoiTool;
    const FreehandRoiTool = cornerstoneTools.FreehandRoiTool;
    const AngleTool = cornerstoneTools.AngleTool;
    const MagnifyTool = cornerstoneTools.MagnifyTool;
    const StackScrollMouseWheelTool =
      cornerstoneTools.StackScrollMouseWheelTool;

    cornerstoneTools.addTool(MagnifyTool);
    cornerstoneTools.addTool(AngleTool);
    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.addTool(LengthTool);
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTouchPinchTool);
    cornerstoneTools.addTool(ZoomTool);
    cornerstoneTools.addTool(ProbeTool);
    cornerstoneTools.addTool(EllipticalRoiTool);
    cornerstoneTools.addTool(RectangleRoiTool);
    cornerstoneTools.addTool(FreehandRoiTool);
    cornerstoneTools.addTool(StackScrollMouseWheelTool);
  };

  const handleToolbarAction = (action: string) => {
    console.log("Action", action);
  };

  const displayImageFromFiles = useCallback((items: ImageItem[]) => {
    const image = items[0].image;
    const element = dicomImageRef.current;
    cornerstone.enable(element);
    cornerstone.displayImage(element, image);
    enableTool();
  }, []);

  const loadImagesIntoCornerstone = useCallback(async () => {
    const imageIds: string[] = [];
    const items: ImageItem[] = [];
    let count = 0;
    let step = 0;

    if (selectedFiles && selectedFiles.length > 0) {
      step = selectedFiles.length / 50;
      let nextProgress = step;
      for (let i = 0; i < selectedFiles?.length; i++) {
        const selectedFile = selectedFiles[i].file;
        if (selectedFile) {
          const fname = selectedFile.data.fname;

          if (GalleryModel.isValidDcmFile(fname)) {
            if (isNifti(fname)) {
              const fileArray = fname.split("/");
              const fileName = fileArray[fileArray.length - 1];
              const imageIdObject = ImageId.fromURL(
                `nifti:${selectedFile.url}${fileName}`
              );
              const numberOfSlices = cornerstone.metaData.get(
                "multiFrameModule",
                imageIdObject.url
              ).numberOfFrames;
              imageIds.push(
                ...Array.from(
                  Array(numberOfSlices),
                  (_, i) =>
                    `nifti:${imageIdObject.filePath}#${imageIdObject.slice.dimension}-${i},t-0`
                )
              );
            } else if (isDicom(fname)) {
              const file = await selectedFile.getFileBlob();
              imageIds.push(
                cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
              );
            } else {
              const file = await selectedFile.getFileBlob();
              imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
            }
          }
        }
      }

      for (let i = 0; i < imageIds.length; i++) {
        cornerstone.loadImage(imageIds[i]).then((image: any) => {
          let item: ImageItem = {} as ImageItem;
          item = {
            imageId: imageIds[i],
            image: image,
          };
          items.push(item);
          count++;
          const progress = Math.floor(count * (100 / selectedFiles.length));

          if (progress > nextProgress) {
            nextProgress += step;
            setProgress(progress);
          }
          if (count === imageIds.length) {
            displayImageFromFiles(items);
          }
        });
      }
    }
  }, [selectedFiles, displayImageFromFiles]);

  useEffect(() => {
    loadImagesIntoCornerstone();
  }, [loadImagesIntoCornerstone]);

  return (
    <>
      <DcmHeader handleToolbarAction={handleToolbarAction} />
      <div
        className="container"
        style={{
          height: "calc(100vh-100px)",
        }}
      >
        <div
          style={{
            width: "96.15%",
            height: "100%",
            color: "#fff",
            position: "absolute",
            fontSize: "1rem",
            textShadow: "1px 1px #000000",
          }}
          className="cornerstone-enabled-image"
        >
          <div
            style={{ width: "100%", height: "100%", position: "relative" }}
            ref={dicomImageRef}
          ></div>
        </div>
      </div>
      <GalleryToolbar
        handleToolbarAction={handleToolbarAction}
        isPlaying={true}
        isFullscreen={true}
      />
    </>
  );
};

export default GalleryDicomView;

function GalleryToolbar({
  handleToolbarAction,
  isPlaying,
  isFullscreen,
}: {
  handleToolbarAction: (action: string) => void;
  isPlaying: boolean;
  isFullscreen: boolean;
}) {
  return (
    <div className="gallery-toolbar">
      <div>
        <div>
          <Button variant="link" onClick={() => handleToolbarAction("")}>
            <AngleDoubleLeftIcon />
          </Button>
          <Button variant="link" onClick={() => handleToolbarAction("")}>
            <StepBackwardIcon />
          </Button>
          <Button variant="link" onClick={() => handleToolbarAction("")}>
            {isPlaying ? <PauseIcon size="md" /> : <PlayIcon size="md" />}
          </Button>
          <Button variant="link" onClick={() => handleToolbarAction("")}>
            <StepForwardIcon />
          </Button>
          <Button variant="link" onClick={() => handleToolbarAction("")}>
            <AngleDoubleRightIcon />
          </Button>
        </div>
      </div>

      <div className="gallary-toolbar__expand-icon">
        <Button variant="link" onClick={() => handleToolbarAction("")}>
          {isFullscreen ? <CompressIcon size="md" /> : <ExpandIcon />}
        </Button>
      </div>
    </div>
  );
}
