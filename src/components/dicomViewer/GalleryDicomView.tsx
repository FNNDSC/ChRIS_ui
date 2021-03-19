import React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneNIFTIImageLoader from "cornerstone-nifti-image-loader";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";
import CornerstoneViewport from "react-cornerstone-viewport";
import { Button, Backdrop, Bullseye, Spinner } from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import { useTypedSelector } from "../../store/hooks";
import GalleryModel from "../../api/models/gallery.model";
import GalleryWrapper from "../gallery/GalleryWrapper";
import * as dicomParser from "dicom-parser";
import { isDicom, isNifti } from "./utils";
import DicomHeader from "./DcmHeader/DcmHeader";
import DicomLoader from "./DcmLoader";

import { Drawer } from "antd";
import DicomTag from "./DicomTag";
import { Image, Viewport } from "./types";
import { FeedFile } from "@fnndsc/chrisapi";
import { import as csTools } from "cornerstone-tools";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.init();
cornerstoneNIFTIImageLoader.external.cornerstone = cornerstone;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneWADOImageLoader.webWorkerManager.initialize({
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      usePDFJS: false,
      strict: false,
    },
  },
});

const scrollToIndex = csTools("util/scrollToIndex");
cornerstoneNIFTIImageLoader.nifti.configure({
  headers: {
    "Content-Type": "application/vnd.collection+json",
    Authorization: "Token " + window.sessionStorage.getItem("AUTH_TOKEN"),
  },
  method: "get",
  responseType: "arrayBuffer",
});
const ImageId = cornerstoneNIFTIImageLoader.nifti.ImageId;

interface EnabledElement {
  element: HTMLElement;
  image?: Image;
  viewport?: Viewport;
  canvas?: HTMLCanvasElement;
  invalid: boolean;
  needsRedraw: boolean;
  layers?: EnabledElementLayer[];
  syncViewports?: boolean;
  lastSyncViewportsState?: boolean;
}
interface EnabledElementLayer {
  element: HTMLElement;
  image?: Image;
  viewport?: Viewport;
  canvas?: HTMLCanvasElement;
  needsRedraw: boolean;
  options?: { renderer?: "webgl" };
}

interface CornerstoneEventData {
  canvasContext?: any;
  element?: HTMLElement;
  enabledElement?: EnabledElement;
  image?: Image;
  renderTimeInMs?: number;
  viewport?: Viewport;
  oldImage?: Image;
  frameRate?: number;
}

interface CornerstoneEvent extends Event {
  detail?: CornerstoneEventData;
}

type GalleryState = {
  inPlay: boolean;
  imageIds: string[];
  activeTool: string;
  tools: any;
  frameRate: number;
  visibleHeader: boolean;
  currentImage: Image | undefined;
  totalFiles: number;
  filesParsed: number;
  frame: number;
  numberOfFrames: number;
};

function getInitialState() {
  return {
    inPlay: false,
    imageIds: [],
    activeTool: "Zoom",
    currentImage: undefined,
    totalFiles: 0,
    filesParsed: 0,
    numberOfFrames: 1,
    tools: [
      {
        name: "Zoom",
        mode: "active",
        modeOptions: { mouseButtonMask: 1 },
      },

      {
        name: "Pan",
        mode: "active",
        modeOptions: { mouseButtonMask: 4 },
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
    frameRate: 22,
    frame: 1,
    visibleHeader: false,
  };
}

const GalleryDicomView = () => {
  const { selectedPlugin, pluginFiles } = useTypedSelector(
    (state) => state.feed
  );
  const [
    galleryDicomState,
    setGalleryDicomState,
  ] = React.useState<GalleryState>(getInitialState);
  const files = selectedPlugin && pluginFiles[selectedPlugin.data.id].files;

  const {
    inPlay,
    totalFiles,
    filesParsed,
    visibleHeader,
    currentImage,
    frameRate,
    frame,
    tools,
    activeTool,
    imageIds,
    numberOfFrames,
  } = galleryDicomState;
  const element = React.useRef<HTMLElement | undefined>(undefined);

  const loadImagesIntoCornerstone = React.useCallback(
    async (dcmArray: FeedFile[]) => {
      const imageIds: string[] = [];
      let numberOfFrames = 0;

      for (let i = 0; i < dcmArray.length; i++) {
        const item = dcmArray[i];
        setGalleryDicomState((state) => {
          return {
            ...state,
            filesParsed: i + 1,
          };
        });

        if (isNifti(item.data.fname)) {
          const fileArray = item.data.fname.split("/");
          const fileName = fileArray[fileArray.length - 1];
          const imageIdObject = ImageId.fromURL(`nifti:${item.url}${fileName}`);
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
          numberOfFrames = numberOfSlices;
        } else {
          if (isDicom(item.data.fname)) {
            const file = await item.getFileBlob();
            imageIds.push(
              cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
            );
            numberOfFrames = imageIds.length;
          } else {
            const file = await item.getFileBlob();
            imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
            numberOfFrames = imageIds.length;
          }
        }
      }

      if (imageIds.length > 0) {
        setGalleryDicomState((state) => {
          return {
            ...state,
            imageIds,
            numberOfFrames,
          };
        });
      }
    },
    []
  );

  React.useEffect(() => {
    if (files && files.length > 0) {
      const dcmArray = getUrlArray(files);
      setGalleryDicomState((state) => {
        return {
          ...state,
          totalFiles: dcmArray.length,
        };
      });
      loadImagesIntoCornerstone(dcmArray);
    }
  }, [files, loadImagesIntoCornerstone]);

  const toolExecute = (tool: string) => {
    runTool(tool);
  };

  const handleOpenImage = (cmdName: string) => {
    runTool("openImage", cmdName);
  };

  const setPlayer = (status: boolean) => {
    setGalleryDicomState({
      ...galleryDicomState,
      inPlay: status,
    });
  };

  const handleGalleryActions = {
    next: () => {
      handleOpenImage("next");
    },
    previous: () => {
      handleOpenImage("previous");
    },
    play: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      });
      handleOpenImage("play");
    },
    pause: () => {
      setGalleryDicomState({
        ...galleryDicomState,
        inPlay: !inPlay,
      });

      handleOpenImage("pause");
    },
    first: () => {
      handleOpenImage("first");
    },
    last: () => {
      handleOpenImage("last");
    },

    zoom: () => {
      toolExecute("Zoom");
    },

    pan: () => {
      toolExecute("Pan");
    },

    wwwc: () => {
      toolExecute("Wwwc");
    },
    invert: () => {
      toolExecute("Invert");
    },

    magnify: () => {
      toolExecute("Magnify");
    },
    rotate: () => {
      toolExecute("Rotate");
    },
    stackScroll: () => {
      toolExecute("StackScroll");
    },
    reset: () => {
      toolExecute("Reset");
    },

    dicomHeader: () => {
      toolExecute("DicomHeader");
    },
  };

  const runCinePlayer = (cmdName: string) => {
    switch (cmdName) {
      case "play": {
        setPlayer(true);
        break;
      }

      case "pause": {
        setPlayer(false);
        break;
      }

      case "next": {
        if (frame < numberOfFrames) {
          const nextFrame = frame + 1;

          setGalleryDicomState({
            ...galleryDicomState,
            frame: nextFrame,
          });
          scrollToIndex(element.current, frame + 1);
        }

        break;
      }
      case "previous": {
        if (frame > 1) {
          const previousFrame = frame - 1;
          setGalleryDicomState({
            ...galleryDicomState,
            frame: previousFrame,
          });
          scrollToIndex(element.current, frame - 1);
        }
        break;
      }

      case "first": {
        const frame = 1;
        setGalleryDicomState({
          ...galleryDicomState,
          frame,
        });

        scrollToIndex(element.current, 0);

        break;
      }

      case "last": {
        const frame = numberOfFrames;
        setGalleryDicomState({
          ...galleryDicomState,
          frame: frame,
        });
        scrollToIndex(element.current, frame - 1);
        break;
      }
    }
  };

  const runTool = (toolName: string, opt?: any) => {
    switch (toolName) {
      case "openImage": {
        runCinePlayer(opt);
        break;
      }
      case "Wwwc": {
        if (activeTool === "Wwwc") return;

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: "Wwwc",
        });
        break;
      }
      case "Pan": {
        if (activeTool === "Pan") return;

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: "Pan",
        });
        break;
      }
      case "Zoom": {
        if (activeTool === "Zoom") return;

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: "Zoom",
        });
        break;
      }
      case "Invert": {
        const viewport = cornerstone.getViewport(element.current);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element.current, viewport);
        break;
      }

      case "Magnify": {
        if (activeTool === "Magnify") return;

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: "Magnify",
        });
        break;
      }
      case "Rotate": {
        const viewport = cornerstone.getViewport(element.current);
        viewport.rotation += 90;
        cornerstone.setViewport(element.current, viewport);
        break;
      }

      case "StackScroll": {
        if (activeTool === "StackScrollMouseWheel") return;

        setGalleryDicomState({
          ...galleryDicomState,
          activeTool: "StackScrollMouseWheel",
        });
        break;
      }

      case "DicomHeader": {
        setGalleryDicomState({
          ...galleryDicomState,
          visibleHeader: !visibleHeader,
        });
        break;
      }

      case "Reset": {
        cornerstone.reset(element.current);
        break;
      }
    }
  };

  const toggleHeader = () => {
    setGalleryDicomState({
      ...galleryDicomState,
      visibleHeader: !visibleHeader,
    });
  };

  return (
    <GalleryWrapper
      total={totalFiles > 0 ? totalFiles : 0}
      handleOnToolbarAction={(action: string) => {
        (handleGalleryActions as any)[action].call();
      }}
      listOpenFilesScrolling={inPlay}
    >
      <Button className="close-btn" variant="link" icon={<CloseIcon />} />
      <React.Suspense fallback={<FallBackComponent />}>
        {imageIds.length === 0 ? (
          <DicomLoader totalFiles={totalFiles} filesParsed={filesParsed} />
        ) : (
          <React.Fragment>
            <DicomHeader
              handleToolbarAction={(action: string) => {
                (handleGalleryActions as any)[action].call();
              }}
            />
            <div className="ami-viewer">
              <div id="container">
                <Drawer
                  title="Dicom Tag Information"
                  placement="right"
                  closable={true}
                  onClose={toggleHeader}
                  visible={visibleHeader}
                >
                  {visibleHeader && <DicomTag image={currentImage} />}
                </Drawer>

                <CornerstoneViewport
                  isPlaying={inPlay}
                  frameRate={frameRate}
                  activeTool={activeTool}
                  tools={tools}
                  imageIds={imageIds}
                  onElementEnabled={(elementEnabledEvt: CornerstoneEvent) => {
                    if (elementEnabledEvt.detail) {
                      const cornerstoneElement =
                        elementEnabledEvt.detail.element;
                      element.current = cornerstoneElement;
                      if (cornerstoneElement) {
                        cornerstoneElement.addEventListener(
                          "cornerstoneimagerendered",
                          (eventData: CornerstoneEvent) => {
                            if (eventData.detail) {
                              const currentImage = eventData.detail.image;
                              const viewport = eventData.detail.viewport;
                              if (viewport) {
                                const newViewport: any = {};
                                newViewport.voi = viewport.voi || {};
                                newViewport.voi.windowWidth =
                                  currentImage && currentImage.windowWidth;
                                newViewport.voi.windowCenter =
                                  currentImage && currentImage.windowCenter;
                                if (!viewport.displayedArea) {
                                  newViewport.displayedArea = {
                                    // Top Left Hand Corner
                                    tlhc: {
                                      x: 0,
                                      y: 0,
                                    },
                                    // Bottom Right Hand Corner
                                    brhc: {
                                      x: 256,
                                      y: 256,
                                    },
                                    rowPixelSpacing: 1,
                                    columnPixelSpacing: 1,
                                    //presentationSizeMode: "SCALE TO FIT",
                                    presentationSizeMode: "SCALE TO FIT",
                                  };
                                }
                                const setViewport = Object.assign(
                                  {},
                                  viewport,
                                  newViewport
                                );

                                cornerstone.setViewport(
                                  cornerstoneElement,
                                  setViewport
                                );
                              }
                            }
                          }
                        );
                      }
                    }
                  }}
                />
              </div>
            </div>
          </React.Fragment>
        )}
      </React.Suspense>
    </GalleryWrapper>
  );
};

/**
 * Only dicom files can be viewed through the gallery.
 *
 * @param feedFiles
 * @returns files
 */

const getUrlArray = (feedFiles: FeedFile[]) => {
  const dcmFiles = feedFiles.filter((item: FeedFile) => {
    return GalleryModel.isValidDcmFile(item.data.fname);
  });

  return dcmFiles;
};

export default GalleryDicomView;

const FallBackComponent = () => {
  return (
    <Backdrop>
      <Bullseye>
        <Spinner />
      </Bullseye>
    </Backdrop>
  );
};
