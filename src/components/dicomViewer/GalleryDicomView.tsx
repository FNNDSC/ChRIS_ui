import React, { useRef, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@patternfly/react-core";
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  StepForwardIcon,
  StepBackwardIcon,
  PauseIcon,
  PlayIcon,
} from "@patternfly/react-icons";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import Hammer from "hammerjs";
import { useTypedSelector } from "../../store/hooks";
import {
  clearFilesForGallery,
  setToolStore,
} from "../../store/explorer/actions";
import DcmHeader from "./DcmHeader/DcmHeader";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init({
  globalToolSyncEnabled: true,
});

const GalleryDicomView = () => {
  const dispatch = useDispatch();
  const files = useTypedSelector((state) => state.explorer.files);
  const [sliceMax, setSliceMax] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const enableDcmTool = useTypedSelector(
    (state) => state.explorer.enableDcmTool
  );

  const dicomImageRef = useRef(null);

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

  const enableToolStore = useCallback(() => {
    if (enableDcmTool) return;
    else {
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
    }
  }, [dispatch, enableDcmTool]);

  const displayImageFromFiles = useCallback(
    (index = 0) => {
      const element = dicomImageRef.current;
      cornerstone.enable(element);
      const image = files[index].image;
      const sliceMax = files[index].sliceMax;
      try {
        cornerstoneTools.clearToolState(element, "stack");
        cornerstoneTools.addStackStateManager(element, [
          "stack",
          "playClip",
          "referenceLines",
        ]);
        const imageIds = files.map((file) => file.imageId);
        cornerstoneTools.addToolState(element, "stack", {
          imageIds: [...imageIds],
          currentImageIdIndex: 0,
        });

        cornerstone.displayImage(element, image);
        setSliceMax(sliceMax);
        setSliceIndex(index);
        // cornerstoneTools.stackPrefetch.enable(element);
      } catch (e) {
        console.warn(e);
      }
    },
    [files]
  );

  React.useEffect(() => {
    return () => {
      dispatch(clearFilesForGallery());
      disableAllTools();
    };
  }, [dispatch, disableAllTools]);

  React.useEffect(() => {
    enableToolStore();
  }, [enableToolStore]);

  React.useEffect(() => {
    displayImageFromFiles();
  }, [displayImageFromFiles, enableToolStore]);

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
      cornerstone.reset(dicomImageRef.current);
      cornerstoneTools.playClip(dicomImageRef.current, 1000);
    } else cornerstoneTools.stopClip(dicomImageRef.current);
  };

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

  return (
    <>
      <DcmHeader
        handleToolbarAction={handleToolbarAction}
        switchFullScreen={switchFullScreen}
        isFullScreen={isFullScreen}
      />

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
          style={{ width: "100%", height: "90%", position: "relative" }}
          ref={dicomImageRef}
        ></div>
        <div style={{ background: "red" }} className="gallery-toolbar">
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
    </>
  );
};

export default GalleryDicomView;
