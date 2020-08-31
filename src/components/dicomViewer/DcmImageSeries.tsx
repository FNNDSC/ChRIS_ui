import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import * as dicomParser from "dicom-parser";
import { Image } from "./types";
import { isDicom } from "./utils";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import DicomHeader from "./DcmHeader/DcmHeader";
import DicomLoader from "./DcmLoader";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.Hammer = Hammer;

type AllProps = {
  imageArray: IUITreeNode[];
  runTool: (ref: any) => void;
  handleToolbarAction: (action: string) => void;
  setEnableTool: (value: boolean) => void;
  dcmEnableTool: boolean;
  toolActive: string;
};

type AllState = {
  items: Image[];
};

// Description: Will be replaced with a DCM File viewer
class DcmImageSeries extends React.Component<AllProps, AllState> {
  _isMounted = false;
  private containerRef: React.RefObject<HTMLInputElement>;
  private _shouldScroll: boolean;

  constructor(props: AllProps) {
    super(props);

    this.containerRef = React.createRef();
    this.state = {
      items: [],
    };
    this._shouldScroll = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.runTool(this);
    if (this.props.imageArray.length > 0) {
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
    let images: Image[] = [];

    images = await Promise.all(
      imageIds.map(async (imageId: string) => {
        const image = await cornerstone.loadImage(imageId);
        return image;
      })
    );

    if (images.length > 0) {
      this.setState(
        {
          items: images,
        },
        () => {
          this.displayImageFromFiles(0);
        }
      );
    }
  };

  handleMouseScroll = (e: MouseWheelEvent) => {
    if (this._shouldScroll) {
      if (e.deltaY > 0) {
        this.props.handleToolbarAction("next");
      } else if (e.deltaY < 0) this.props.handleToolbarAction("previous");
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.items.length === 0 ? (
          <DicomLoader />
        ) : (
          <React.Fragment>
            <DicomHeader
              toolActive={this.props.toolActive}
              handleToolbarAction={this.props.handleToolbarAction}
            />
            <div className="ami-viewer">
              <div ref={this.containerRef} id="container">
                <canvas className="cornerstone-canvas" />
              </div>
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }

  runTool = (toolName: string, opt?: any) => {
    switch (toolName) {
      case "openImage": {
        cornerstone.disable(this.containerRef.current);
        this.displayImageFromFiles(opt);
        break;
      }
      case "Wwwc": {
        cornerstoneTools.setToolActive("Wwwc", { mouseButtonMask: 1 });
        break;
      }
      case "Pan": {
        cornerstoneTools.setToolActive("Pan", { mouseButtonMask: 1 });
        break;
      }
      case "Zoom": {
        cornerstoneTools.setToolActive("Zoom", {
          mouseButtonMask: 1,
        });
        break;
      }
      case "Invert": {
        const element = this.containerRef.current;
        const viewport = cornerstone.getViewport(element);
        viewport.invert = !viewport.invert;
        cornerstone.setViewport(element, viewport);
        break;
      }

      case "Magnify": {
        cornerstoneTools.setToolActive("Magnify", {
          mouseButtonMask: 1,
        });
        break;
      }
      case "Rotate": {
        const element = this.containerRef.current;
        const viewport = cornerstone.getViewport(element);
        viewport.rotation -= 90;
        cornerstone.setViewport(element, viewport);
        break;
      }

      case "Reset": {
        cornerstone.reset(this.containerRef.current);
        break;
      }
    }
  };

  enableTools = () => {
    if (this.props.dcmEnableTool) return;
    const WwwcTool = cornerstoneTools.WwwcTool;
    const PanTool = cornerstoneTools.PanTool;
    const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
    const ZoomTool = cornerstoneTools.ZoomTool;
    const MagnifyTool = cornerstoneTools.MagnifyTool;
    const RotateTool = cornerstoneTools.RotateTool;

    cornerstoneTools.addTool(MagnifyTool);
    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTouchPinchTool);
    cornerstoneTools.addTool(ZoomTool);
    cornerstoneTools.addTool(RotateTool);
    this.props.setEnableTool(true);
  };

  disableAllTools = () => {
    this.props.setEnableTool(false);
    cornerstone.disable(this.containerRef.current);
  };

  // helper function used by the tool button handlers to disable the active tool
  // before making a new tool active

  displayImageFromFiles = async (index: number) => {
    const element = this.containerRef.current; // console.log("initialize AMI", this.state, container);
    if (!!element) {
      this._shouldScroll = true;
      cornerstone.enable(element);
      cornerstone.displayImage(element, this.state.items[index]);
      element.addEventListener("wheel", this.handleMouseScroll);
      this.enableTools();
    }
  };

  // Destroy Methods
  componentWillUnmount() {
    this._isMounted = false;
    this._shouldScroll = false;
    this.disableAllTools();
  }
}

export default DcmImageSeries;
