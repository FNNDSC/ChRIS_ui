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
import Hammer from "hammerjs";
import { Button, Progress, Slider } from "@patternfly/react-core";
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  StepForwardIcon,
  StepBackwardIcon,
  PauseIcon,
  PlayIcon,
} from "@patternfly/react-icons";
import DcmHeader from "./DcmHeader/DcmHeader";
import GalleryModel from "../../api/models/gallery.model";
import { DataNode } from "../../store/explorer/types";
import { useTypedSelector } from "../../store/hooks";
import { setToolStore } from "../../store/explorer/actions";
import { isDicom, isNifti } from "./utils";
import "./amiViewer.scss";
import "../gallery/GalleryToolbar/GalleryToolbar.scss";
import DcmLoader from "./DcmLoader";

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
  const selectedFiles = useTypedSelector(
    (state) => state.explorer.selectedFolder
  );

  const enableDcmTool = useTypedSelector(
    (state) => state.explorer.enableDcmTool
  );
  const dispatch = useDispatch();
  const [filesParsed, setFilesParsed] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageIdsState, setImageIds] = useState<string[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [sliceMax, setSliceMax] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const dicomImageRef = useRef(null);
  const itemsRef = useRef<ImageItem[] | undefined>();

  const enableToolStore = useCallback(() => {
    console.log("EnableToolStore");
    if (enableDcmTool) return;
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
    dispatch(setToolStore(true));
  }, [dispatch, enableDcmTool]);

  const disableAllTools = useCallback(() => {
    dispatch(setToolStore(false));
    cornerstoneTools.setToolEnabled("Length");
    cornerstoneTools.setToolEnabled("Pan");
    cornerstoneTools.setToolEnabled("Magnify");
    cornerstoneTools.setToolEnabled("Angle");
    cornerstoneTools.setToolEnabled("RectangleRoi");
    cornerstoneTools.setToolEnabled("Wwwc");
    cornerstoneTools.setToolEnabled("ZoomTouchPinch");
    cornerstoneTools.setToolEnabled("Probe");
    cornerstoneTools.setToolEnabled("EllipticalRoi");
    cornerstoneTools.setToolEnabled("FreehandRoi");
  }, [dispatch]);

  const displayImageFromFiles = useCallback(
    async (index: number, imageIds?: string[]) => {
      if (itemsRef.current && dicomImageRef.current) {
        const element = dicomImageRef.current;
        const imageId = itemsRef.current[index].imageId;
        cornerstone.enable(element);
        try {
          cornerstoneTools.clearToolState(element, "stack");
          cornerstoneTools.addStackStateManager(element, [
            "stack",
            "playClip",
            "referenceLines",
          ]);
          if (imageIds) {
            cornerstoneTools.addToolState(element, "stack", {
              imageIds: [...imageIds],
              currentImageIdIndex: index,
            });
          } else {
            cornerstoneTools.addToolState(element, "stack", {
              imageIds: [...imageIdsState],
              currentImageIdIndex: index,
            });
          }

          const image = await cornerstone.loadAndCacheImage(imageId);
          cornerstone.displayImage(element, image);
          cornerstoneTools.stackPrefetch.enable(element);
        } catch (error) {
          console.log("Error");
        }
      }
    },
    []
  );

  const loadImagesIntoCornerstone = useCallback(
    async (files: DataNode[]) => {
      const imageIds: string[] = [];
      const items: ImageItem[] = [];
      let count = 0;
      let sliceMax = 0;

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const selectedFile = files[i].file;
          setFilesParsed(i + 1);
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
            if (count === imageIds.length) {
              cornerstone.disable(dicomImageRef.current);
              itemsRef.current = items;
              setSliceMax(sliceMax);
              setImageIds(imageIds);
              displayImageFromFiles(0, imageIds);
            }
          });
        }
      }
    },
    [displayImageFromFiles]
  );

  useEffect(() => {
    console.log("Use Effect");
    if (selectedFiles && selectedFiles.length > 0) {
      const dcmArray = getUrlArray(selectedFiles);
      setTotalFiles(dcmArray.length);
      enableToolStore();
      loadImagesIntoCornerstone(dcmArray);
    }

    return () => {
      disableAllTools();
    };
  }, [
    loadImagesIntoCornerstone,
    selectedFiles,
    disableAllTools,
    enableToolStore,
  ]);

  const handleToolbarAction = (action: string) => {
    const element = dicomImageRef.current;
    switch (action) {
      case "zoom": {
        cornerstoneTools.setToolActiveForElement(element, "Zoom", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "pan": {
        cornerstoneTools.setToolActiveForElement(element, "Pan", {
          mouseButtonMask: 1,
        });
        break;
      }

      case "magnify": {
        cornerstoneTools.setToolActiveForElement(element, "Magnify", {
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

  const switchFullScreen = () => {
    const element: any = dicomImageRef.current;
    if (!isFullScreen && element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        /* Firefox */
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        element?.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        /* IE/Edge */
        element.msRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  const listOpenFilesFirstFrame = () => {
    const frame = 1;
    setSliceIndex(frame);
    displayImageFromFiles(frame);
  };

  const listOpenFilesPreviousFrame = () => {
    if (sliceIndex > 1) {
      const previousFrame = sliceIndex - 1;
      setSliceIndex(previousFrame);
      setSliceIndex(sliceIndex);
      displayImageFromFiles(previousFrame);
    }
  };

  const listOpenFilesNextFrame = () => {
    if (sliceIndex < sliceMax) {
      const nextFrame = sliceIndex + 1;
      setSliceIndex(nextFrame);
      displayImageFromFiles(nextFrame);
    }
  };

  const listOpenFilesLastFrame = () => {
    const frame = sliceMax - 1;
    setSliceIndex(frame);
    displayImageFromFiles(frame);
  };

  const listOpenFilesScrolling = () => {
    setPlaying(!playing);
    if (!playing) {
      cornerstoneTools.playClip(dicomImageRef.current, 15);
    } else cornerstoneTools.stopClip(dicomImageRef.current);
  };

  const handleSliceChange = (value: number) => {
    const index = Math.floor(value);
    setSliceIndex(index);
    displayImageFromFiles(index);
  };

  return (
    <div
      className="container"
      style={{
        height: "100vh",
      }}
    >
      <DcmHeader
        handleToolbarAction={handleToolbarAction}
        switchFullScreen={switchFullScreen}
        isFullScreen={isFullScreen}
      />
      {imageIdsState.length === 0 ? (
        <DcmLoader totalFiles={totalFiles} filesParsed={filesParsed} />
      ) : (
        <>
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
            <Slider
              value={sliceIndex}
              onChange={handleSliceChange}
              min={0}
              max={sliceMax - 1}
              step={100 / sliceMax}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GalleryDicomView;

const getUrlArray = (feedFiles: DataNode[]) => {
  const dcmFiles = feedFiles.filter((item: DataNode) => {
    if (item.file) return GalleryModel.isValidDcmFile(item.file.data.fname);
  });
  return dcmFiles;
};
