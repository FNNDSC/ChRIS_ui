import React from "react";
import { Button } from "@patternfly/react-core";
import {
  AiFillCaretLeft,
  AiFillCaretRight,
  AiFillStepForward,
  AiFillStepBackward,
  AiFillPauseCircle,
  AiFillPlayCircle,
} from "react-icons/ai";
import CornerstoneViewport from "react-cornerstone-viewport";
import * as dicomParser from "dicom-parser";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import { useTypedSelector } from "../../store/hooks";
import { GalleryState, CornerstoneEvent } from "./types";
import "./GalleryDicomView.scss";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init({
  globalToolSyncEnabled: true,
});
cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const getInitialState = () => {
  return {
    inPlay: false,
    imageIds: [] as any[],
    activeTool: "Zoom",
    numberOfFrames: 1,
    tools: [
      {
        name: "Zoom",
        mode: "active",
        modeOptions: { mouseButtonMask: 2 },
      },

      {
        name: "Pan",
        mode: "active",
        modeOptions: { mouseButtonMask: 1 },
      },
      {
        name: "Wwwc",
        mode: "active",
        modeOptions: { mouseButtonMask: 1 },
      },
      {
        name: "StackScrollMouseWheel",
        mode: "active",
      },
      { name: "Magnify", mode: "active" },
    ],
  };
};

const GalleryDicomView = () => {
  const files = useTypedSelector((state) => state.explorer.files);
  const [galleryState, setGalleryState] =
    React.useState<GalleryState>(getInitialState);
  const { activeTool, imageIds, tools, inPlay } = galleryState;

  const element = React.useRef<HTMLElement | undefined>(undefined);

  React.useEffect(() => {
    if (files.length > 0) {
      const filteredIds = files.map((file) => file.imageId);
      setGalleryState((galleryState) => {
        return {
          ...galleryState,
          imageIds: filteredIds,
          numberOfFrames: filteredIds.length,
        };
      });
    }
  }, [files]);

  /*
  const dispatch = useDispatch();
  const files = useTypedSelector((state) => state.explorer.files);
  const [sliceMax, setSliceMax] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const galleryFiles = dispatchFiles ? dispatchFiles : files;

  const dicomImageRef = useRef(null);

  const disableAllTools = useCallback(() => {
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
  }, []);

  const enableToolStore = useCallback(() => {
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
  }, []);

  const displayImageFromFiles = useCallback(
    (index = 0) => {
      const element = dicomImageRef.current;
      cornerstone.enable(element);

      const image = files[index]?.image;
      const sliceMax = files[index]?.sliceMax;

      try {
        cornerstoneTools.clearToolState(element, "stack");
        cornerstoneTools.addStackStateManager(element, [
          "stack",
          "playClip",
          "referenceLines",
        ]);
        const imageIds = galleryFiles.map((file) => file.imageId);
        cornerstoneTools.addToolState(element, "stack", {
          imageIds: [...imageIds],
          currentImageIdIndex: 0,
        });

        cornerstone.displayImage(element, image);
        setSliceIndex(index);
        setSliceMax(sliceMax);
      } catch (e) {
        console.warn(e);
      }
    },
    [galleryFiles]
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
    displayImageFromFiles(frame);
  };

  const listOpenFilesPreviousFrame = () => {
    if (sliceIndex > 1) {
      const previousFrame = sliceIndex - 1;
      displayImageFromFiles(previousFrame);
    }
  };

  const listOpenFilesNextFrame = () => {
    if (sliceIndex < sliceMax) {
      const nextFrame = sliceIndex + 1;
      displayImageFromFiles(nextFrame);
    }
  };

  const listOpenFilesLastFrame = () => {
    const frame = sliceMax - 1;
    displayImageFromFiles(frame);
  };

  const listOpenFilesScrolling = () => {
    setPlaying(!playing);
    if (!playing) {
      cornerstone.reset(dicomImageRef.current);
      cornerstoneTools.playClip(dicomImageRef.current);
    } else {
      cornerstone.reset(dicomImageRef.current);
      cornerstoneTools.stopClip(dicomImageRef.current);
    }
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
        const viewport = cornerstone.getViewport(elementhttps://github.com/FNNDSC/ChRIS_ultron_backEnd.git);
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
        /* Firefox 
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera 
        element?.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        /* IE/Edge 
        element.msRequestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  console.log("Slice index, slice max", sliceIndex, sliceMax);

  return (
    <div className="gallery-dicom">
  
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
      </div>
      <div
        style={{
          margin: "0 auto",
        }}
        className="gallery-toolbar"
      >
        <Button variant="link" onClick={listOpenFilesFirstFrame}>
          <AngleDoubleLeftIcon />
        </Button>
        <Button variant="link" onClick={listOpenFilesPreviousFrame}>
          <StepBackwardIcon />
        </Button>
        <Button variant="link" onClick={listOpenFilesScrolling}>
          {playing === true ? <PauseIcon size="md" /> : <PlayIcon size="md" />}
        </Button>
        <Button variant="link" onClick={listOpenFilesNextFrame}>
          <StepForwardIcon />
        </Button>
        <Button variant="link" onClick={listOpenFilesLastFrame}>
          <AngleDoubleRightIcon />
        </Button>
      </div>galleryState
  );
  */

  const listOpenFilesFirstFrame = () => {
    console.log("Test");
  };
  const listOpenFilesPreviousFrame = () => {
    console.log("Test");
  };
  const listOpenFilesScrolling = () => {
    setGalleryState({
      ...galleryState,
      inPlay: !inPlay,
    });
  };
  const listOpenFilesNextFrame = () => {
    console.log("Test");
  };
  const listOpenFilesLastFrame = () => {
    console.log("Test");
  };

  return (
    <>
      <CornerstoneViewport
        style={{
          height: "100vh",
          width: "100%",
        }}
        isPlaying={inPlay}
        activeTool={activeTool}
        imageIds={imageIds}
        frameRate={30}
        tools={tools}
        onElementEnabled={(elementEnabledEvt: CornerstoneEvent) => {
          if (elementEnabledEvt.detail) {
            const cornerstoneElement = elementEnabledEvt.detail.element;
            element.current = cornerstoneElement;
          }
        }}
      />

      <div
        style={{
          margin: "0 auto",
        }}
        className="gallery-toolbar"
      >
        <Button variant="link" onClick={listOpenFilesFirstFrame}>
          <AiFillCaretLeft />
        </Button>
        <Button variant="link" onClick={listOpenFilesPreviousFrame}>
          <AiFillStepBackward />
        </Button>
        <Button variant="link" onClick={listOpenFilesScrolling}>
          {inPlay === true ? <AiFillPauseCircle /> : <AiFillPlayCircle />}
        </Button>
        <Button variant="link" onClick={listOpenFilesNextFrame}>
          <AiFillStepForward />
        </Button>
        <Button variant="link" onClick={listOpenFilesLastFrame}>
          <AiFillCaretRight />
        </Button>
      </div>
    </>
  );
};

export default GalleryDicomView;
