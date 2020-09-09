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
};

// Description: Will be replaced with a DCM File viewer
class DcmImageSeries extends React.Component<AllProps, AllState> {
  _isMounted = false;

  constructor(props: AllProps) {
    super(props);

    this.state = {
      imageIds: [],
      element: null,
      activeTool: "Zoom",
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
                  isPlaying={this.props.inPlay}
                  frameRate={this.state.frameRate}
                  activeTool={this.state.activeTool}
                  tools={this.state.tools}
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
    switch (cmdName) {
      case "play": {
        this.props.setPlayer(true);
        break;
      }

      case "pause": {
        this.props.setPlayer(false);
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
