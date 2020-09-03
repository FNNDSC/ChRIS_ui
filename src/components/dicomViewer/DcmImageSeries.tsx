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

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.init();

type AllProps = {
  inPlay: boolean;
  imageArray: IUITreeNode[];
  runTool: (ref: any) => void;
  handleToolbarAction: (action: string) => void;
};

type AllState = {
  imageIds: string[];
  element: any;
  isViewerZoomMode: boolean;
  isViewerPanMode: boolean;
  isViewerStackScrollMode: boolean;
  isViewerMagnifyMode: boolean;
  isViewerWwwcMode: boolean;
};

// Description: Will be replaced with a DCM File viewer
class DcmImageSeries extends React.Component<AllProps, AllState> {
  _isMounted = false;

  constructor(props: AllProps) {
    super(props);

    this.state = {
      imageIds: [],
      element: null,
      isViewerZoomMode: false,
      isViewerPanMode: false,
      isViewerStackScrollMode: false,
      isViewerMagnifyMode: false,
      isViewerWwwcMode: false,
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
    if (prevProps.imageArray.length !== this.props.imageArray.length) {
      if (this.props.imageArray.length > 0) {
        this.loadImagesIntoCornerstone();
      }
    }
  }

  loadImagesIntoCornerstone = async () => {
    const { imageArray } = this.props;
    if (imageArray.length < 0) return;
    let imageIds: string[] = [];
    for (let i = 0; i < imageArray.length; i++) {
      const item = imageArray[i];

      if (isDicom(item.module)) {
        const file = await item.file.getFileBlob();
        imageIds.push(cornerstoneWADOImageLoader.wadouri.fileManager.add(file));
      } else {
        const file = await item.file.getFileBlob();
        imageIds.push(cornerstoneFileImageLoader.fileManager.add(file));
      }
    }

    if (imageIds.length > 0) {
      this.setState({
        imageIds,
      });
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.imageIds.length === 0 ? (
          <DicomLoader />
        ) : (
          <React.Fragment>
            <DicomHeader handleToolbarAction={this.props.handleToolbarAction} />
            <div className="ami-viewer">
              <div id="container">
                <CornerstoneViewport
                  imageIds={this.state.imageIds}
                  onElementEnabled={(elementEnabledEvt: any) => {
                    const cornerstoneElement = elementEnabledEvt.detail.element;
                    this.setState({
                      element: cornerstoneElement,
                    });

                    cornerstoneElement.addEventListener(
                      "cornerstoneimagerendered",
                      (eventData: any) => {
                        const viewport = eventData.detail.viewport;
                        const image = eventData.detail.image;
                        const newViewport: any = {};
                        newViewport.voi = viewport.voi || {};
                        newViewport.voi.windowWidth = image.windowWidth;
                        newViewport.voi.windowCenter = image.windowCenter;
                        if (!viewport.displayedArea) {
                          newViewport.displayedArea = {
                            // Top Left Hand Corner
                            tlhc: {
                              x: 1,
                              y: 1,
                            },
                            // Bottom Right Hand Corner
                            brhc: {
                              x: 256,
                              y: 256,
                            },
                            rowPixelSpacing: 1,
                            columnPixelSpacing: 1,
                            //presentationSizeMode: "SCALE TO FIT",
                            presentationSizeMode: "None",
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
                    );
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
    const element = this.state.element;

    switch (cmdName) {
      case "play": {
        cornerstoneTools.playClip(element, 30);
        break;
      }

      case "pause": {
        cornerstoneTools.stopClip(element);
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
        //if (this.state.isViewerWwwcMode) return;
        this.setState(
          {
            isViewerWwwcMode: true,
            isViewerPanMode: false,
            isViewerZoomMode: false,
            isViewerMagnifyMode: false,
          },
          () => {
            if (this.state.isViewerWwwcMode) {
              const WwwcTool = cornerstoneTools.WwwcTool;
              cornerstoneTools.addTool(WwwcTool);
              cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
            } else if (!this.state.isViewerWwwcMode) {
              cornerstoneTools.setToolPassive("Wwwc", {
                mouseButtonMask: 1,
              });
            }
          }
        );
        break;
      }
      case "Pan": {
        if (this.state.isViewerPanMode) return;
        this.setState(
          {
            isViewerPanMode: true,
            isViewerZoomMode: false,
            isViewerWwwcMode: true,
            isViewerMagnifyMode: false,
          },
          () => {
            if (this.state.isViewerPanMode) {
              const PanTool = cornerstoneTools.PanTool;
              cornerstoneTools.addTool(PanTool);
              cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
            } else {
              cornerstoneTools.setToolPassive("Pan", {
                mouseButtonMask: 1,
              });
            }
          }
        );
        break;
      }
      case "Zoom": {
        if (this.state.isViewerZoomMode) return;

        this.setState(
          {
            isViewerZoomMode: true,
            isViewerPanMode: false,
            isViewerWwwcMode: false,
            isViewerMagnifyMode: false,
          },
          () => {
            if (this.state.isViewerZoomMode) {
              const ZoomTool = cornerstoneTools.ZoomTool;
              cornerstoneTools.addTool(ZoomTool, {
                configuration: {
                  invert: false,
                  preventZoomOutsideImage: false,
                  minScale: 0.1,
                  maxScale: 20.0,
                },
              });
              cornerstoneTools.setToolActive("Zoom", { mouseButtonMask: 1 });
            } else {
              cornerstoneTools.setToolPassive("Zoom", {
                mouseButtonMask: 1,
              });
            }
          }
        );

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
        if (this.state.isViewerMagnifyMode) return;
        this.setState(
          {
            isViewerMagnifyMode: true,
            isViewerZoomMode: false,
            isViewerPanMode: false,
            isViewerWwwcMode: false,
          },
          () => {
            if (this.state.isViewerMagnifyMode) {
              const MagnifyTool = cornerstoneTools.MagnifyTool;
              cornerstoneTools.addTool(MagnifyTool);
              cornerstoneTools.setToolActive("Magnify", { mouseButtonMask: 1 });
            } else {
              cornerstoneTools.setToolPassive("Magnify", {
                mouseButtonMask: 1,
              });
            }
          }
        );
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
        if (this.state.isViewerStackScrollMode) return;
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
