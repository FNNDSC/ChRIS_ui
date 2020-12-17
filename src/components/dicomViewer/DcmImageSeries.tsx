import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import * as dicomParser from "dicom-parser";
import { isDicom } from "./utils";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import DicomHeader from "./DcmHeader/DcmHeader";
import DicomLoader from "./DcmLoader";
import CornerstoneViewport from "react-cornerstone-viewport";
import { Drawer } from "antd";
import DicomTag from "./DicomTag";
import { Image, Viewport } from "./types";
import { import as csTools } from "cornerstone-tools";


cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.Hammer = Hammer;

const scrollToIndex = csTools("util/scrollToIndex");

type AllProps = {
  inPlay: boolean;
  imageArray: IUITreeNode[];
  runTool: (ref: any) => void;
  handleToolbarAction: (action: string) => void;
  setPlayer: (status: boolean) => void;
 
};

type AllState = {
  imageIds: string[];
  element: any;
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

// Description: Will be replaced with a DCM File viewer
class DcmImageSeries extends React.Component<AllProps, AllState> {
  _isMounted = false;

  constructor(props: AllProps) {
    super(props);

    this.state = {
      imageIds: [],
      element: null,
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

  componentDidMount() {
    this._isMounted = true;
    this.props.runTool(this);
    if (this._isMounted && this.props.imageArray.length > 0) {
      this.loadImagesIntoCornerstone();
    }
  }

  componentDidUpdate(prevProps: AllProps) {
    this._isMounted = true;
    if (
      this._isMounted &&
      prevProps.imageArray.length !== this.props.imageArray.length
    ) {
      if (this.props.imageArray.length > 0) {
        this.loadImagesIntoCornerstone();
      }
    }
  }

  loadImagesIntoCornerstone = async () => {
    const { imageArray } = this.props;
    if (imageArray.length < 0) return;

    let imageIds: string[] = [];
    if (this._isMounted) {
      this.setState({
        totalFiles: imageArray.length,
      });

      for (let i = 0; i < imageArray.length; i++) {
        const item = imageArray[i];

        this.setState({
          filesParsed: i + 1,
        });

        if (isDicom(item.module)) {
          const file = await item.file.getFileBlob();
          imageIds.push(
            cornerstoneWADOImageLoader.wadouri.fileManager.add(file)
          );
        } else {
          const file = await item.file.getFileBlob();
          imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
        }
      }

      if (this._isMounted) {
        if (imageIds.length > 0) {
          this.setState({
            imageIds,
            numberOfFrames: imageIds.length,
          });
        }
      }
    }
  };

  toggleHeader = () => {
    this.setState({
      visibleHeader: !this.state.visibleHeader,
    });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.imageIds.length === 0 ? (
          <DicomLoader
            totalFiles={this.state.totalFiles}
            filesParsed={this.state.filesParsed}
          />
        ) : (
          <React.Fragment>
            <DicomHeader handleToolbarAction={this.props.handleToolbarAction} />

            <div className="ami-viewer">
              <div id="container">
                <Drawer
                  title="Dicom Tag Information"
                  placement="right"
                  closable={true}
                  onClose={this.toggleHeader}
                  visible={this.state.visibleHeader}
                  style={{ position: "absolute", width: "40%" }}
                >
                  {this.state.visibleHeader && (
                    <DicomTag image={this.state.currentImage} />
                  )}
                </Drawer>

                <CornerstoneViewport
                  isPlaying={this.props.inPlay}
                  frameRate={this.state.frameRate}
                  activeTool={this.state.activeTool}
                  tools={this.state.tools}
                  imageIds={this.state.imageIds}
                  onElementEnabled={(elementEnabledEvt: CornerstoneEvent) => {
                    if (elementEnabledEvt.detail) {
                      const cornerstoneElement =
                        elementEnabledEvt.detail.element;
                      this.setState({
                        element: cornerstoneElement,
                      });

                      if (cornerstoneElement) {
                        cornerstoneElement.addEventListener(
                          "cornerstoneimagerendered",
                          (eventData: CornerstoneEvent) => {
                            if (eventData.detail) {
                              const currentImage = eventData.detail.image;

                              this.setState({
                                currentImage,
                              });

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
      </React.Fragment>
    );
  }

  runCinePlayer = (cmdName: string) => {
    switch (cmdName) {
      case "play": {
        this.props.setPlayer(true);
        break;
      }

      case "pause": {
        this.props.setPlayer(false);
        break;
      }

      case "next": {
        if (this.state.frame < this.state.numberOfFrames) {
          let frame = this.state.frame + 1;
          this.setState(
            {
              frame,
            },
            () => {
              scrollToIndex(this.state.element, this.state.frame - 1);
            }
          );
        }

        break;
      }
      case "previous": {
        if (this.state.frame > 1) {
          let frame = this.state.frame - 1;
          this.setState(
            {
              frame,
            },
            () => {
              scrollToIndex(this.state.element, frame - 1);
            }
          );
        }
        break;
      }
      case "first": {
        let frame = 1;
        this.setState(
          {
            frame,
          },
          () => {
            scrollToIndex(this.state.element, 0);
          }
        );
        break;
      }

      case "last": {
        let frame = this.state.numberOfFrames;
        this.setState({ frame: frame });
        scrollToIndex(this.state.element, frame - 1);
        break;
      }
    }
  };

  runTool = (toolName: string, opt?: any) => {
    switch (toolName) {
      case "openImage": {
        this.runCinePlayer(opt);
        break;
      }
      case "Wwwc": {
        if (this.state.activeTool === "Wwwc") return;

        this.setState({
          activeTool: "Wwwc",
        });
        break;
      }
      case "Pan": {
        if (this.state.activeTool === "Pan") return;

        this.setState({
          activeTool: "Pan",
        });
        break;
      }
      case "Zoom": {
        if (this.state.activeTool === "Zoom") return;

        this.setState({
          activeTool: "Zoom",
        });
        break;
      }
      case "Invert": {
        const element = this.state.element;
        let viewport = cornerstone.getViewport(element);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element, viewport);
        break;
      }

      case "Magnify": {
        if (this.state.activeTool === "Magnify") return;

        this.setState({
          activeTool: "Magnify",
        });
        break;
      }
      case "Rotate": {
        const element = this.state.element;
        const viewport = cornerstone.getViewport(element);
        viewport.rotation -= 90;
        cornerstone.setViewport(element, viewport);
        break;
      }

      case "StackScroll": {
        if (this.state.activeTool === "StackScrollMouseWheel") return;

        this.setState({
          activeTool: "StackScrollMouseWheel",
        });
        break;
      }

      case "DicomHeader": {
        this.setState({
          visibleHeader: !this.state.visibleHeader,
        });
        break;
      }

      case "Reset": {
        cornerstone.reset(this.state.element);
        break;
      }
    }
  };

  // Destroy Methods
  componentWillUnmount() {
    this._isMounted = false;

    if (this.props.inPlay) {
      cornerstoneTools.stopClip(this.state.element);
    }
  }
}

export default DcmImageSeries;
