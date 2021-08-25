import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as dicomParser from "dicom-parser";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import { import as csTools } from "cornerstone-tools";
import Hammer from "hammerjs";
import { Progress, ProgressSize, Button, Slider } from "@patternfly/react-core";
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  StepForwardIcon,
  StepBackwardIcon,
  CompressIcon,
  PauseIcon,
  PlayIcon,
  ExpandIcon,
} from "@patternfly/react-icons";
import DcmHeader from "./DcmHeader/DcmHeader";
import GalleryModel from "../../api/models/gallery.model";
import { DataNode } from "../../store/explorer/types";
import { useTypedSelector } from "../../store/hooks";
import { isDicom, isNifti } from "./utils";
import "./amiViewer.scss";
import "../gallery/GalleryToolbar/GalleryToolbar.scss";

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

const scrollToIndex = csTools("util/scrollToIndex");

cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("CHRIS_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

const enableToolStore = () => {
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
};

const GalleryDicomView = (props: { files?: DataNode[] }) => {
  const selectedFiles = useTypedSelector(
    (state) => state.explorer.selectedFolder
  );

  const [progress, setProgress] = useState(0);
  const [sliceMax, setSliceMax] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dicomImageRef = useRef(null);
  const timerScrolling = useRef<NodeJS.Timeout>();
  const itemsRef = useRef<ImageItem[] | undefined>();

  const displayImageFromFiles = useCallback((index: number) => {
    if (itemsRef.current) {
      const element = dicomImageRef.current;
      const image = itemsRef.current[index].image;
      cornerstone.enable(element);
      cornerstone.displayImage(element, image);
      setSliceIndex(index);
    }
  }, []);

  React.useEffect(() => {
    enableToolStore();
  }, []);

  const loadImagesIntoCornerstone = useCallback(async () => {
    const imageIds: string[] = [];
    const items: ImageItem[] = [];
    let count = 0;
    let step = 0;
    let sliceMax = 0;

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
              sliceMax = numberOfSlices;
            } else if (isDicom(fname)) {
              const file = await selectedFile.getFileBlob();
              imageIds.push(
                cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
              );
              sliceMax = imageIds.length;
            } else {
              const file = await selectedFile.getFileBlob();
              imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
              sliceMax = imageIds.length;
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
            cornerstone.disable(dicomImageRef.current);
            setSliceMax(sliceMax);
            displayImageFromFiles(0);
          }
        });
      }
    }
  }, [displayImageFromFiles, selectedFiles]);

  useEffect(() => {
    loadImagesIntoCornerstone();
  }, [loadImagesIntoCornerstone]);

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case "zoom": {
        cornerstoneTools.setToolActive("Zoom", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "pan": {
        cornerstoneTools.setToolActive("Pan", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "magnify": {
        cornerstoneTools.setToolActive("Magnify", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "invert": {
        const element = dicomImageRef.current;
        const viewport = cornerstone.getViewport(element);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element, viewport);
        cornerstoneTools.setToolActive;
        break;
      }

      case "rotate": {
        const viewport = cornerstone.getViewport(dicomImageRef.current);
        viewport.rotation += 90;
        cornerstone.setViewport(dicomImageRef.current, viewport);
        break;
      }

      case "wwwc": {
        cornerstoneTools.setToolActive("Wwwc", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "reset": {
        cornerstone.reset(dicomImageRef.current);
        break;
      }
      default:
        break;
    }
  };

  const listOpenFilesFirstFrame = () => {
    const frame = 1;
    setSliceIndex(frame);
    scrollToIndex(dicomImageRef.current, frame);
  };

  const listOpenFilesPreviousFrame = () => {
    if (sliceIndex > 1) {
      const previousFrame = sliceIndex - 1;
      setSliceIndex(previousFrame);
      setSliceIndex(sliceIndex);
      scrollToIndex(dicomImageRef.current, previousFrame);
    }
  };

  const listOpenFilesNextFrame = () => {
    if (sliceIndex < sliceMax) {
      const nextFrame = sliceIndex + 1;
      setSliceIndex(nextFrame);
      scrollToIndex(dicomImageRef.current, nextFrame);
    }
  };

  const listOpenFilesLastFrame = () => {
    const frame = sliceMax - 1;
    setSliceIndex(frame);
    scrollToIndex(dicomImageRef.current, frame);
  };

  const listOpenFilesScrolling = () => {
    console.log("Currently Testing");
  };

  const handleSliceChange = (value: number) => {
    const index = Math.floor(value);
    setSliceIndex(index);
    displayImageFromFiles(index);
  };

  return (
    <>
      <div
        className="container"
        style={{
          height: "100vh",
        }}
      >
        <DcmHeader handleToolbarAction={handleToolbarAction} />
        <div
          style={{
            width: "100%",
            height: "100%",
            color: "#fff",
            position: "relative",
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
        <div className="gallery-toolbar">
          <div>
            <div>
              <Button variant="link" onClick={listOpenFilesFirstFrame}>
                <AngleDoubleLeftIcon />
              </Button>
              <Button variant="link" onClick={listOpenFilesPreviousFrame}>
                <StepBackwardIcon />
              </Button>
              <Button variant="link" onClick={listOpenFilesScrolling}>
                {playing === true ? (
                  <PauseIcon size="md" />
                ) : (
                  <PlayIcon size="md" />
                )}
              </Button>
              <Button variant="link" onClick={listOpenFilesNextFrame}>
                <StepForwardIcon />
              </Button>
              <Button variant="link" onClick={listOpenFilesLastFrame}>
                <AngleDoubleRightIcon />
              </Button>
            </div>
          </div>

          <div className="gallary-toolbar__expand-icon">
            <Button variant="link"></Button>
          </div>
        </div>
        <Slider
          value={sliceIndex}
          onChange={handleSliceChange}
          min={0}
          max={sliceMax - 1}
          step={100 / sliceMax}
        />
      </div>
    </>
  );
};

export default GalleryDicomView;
