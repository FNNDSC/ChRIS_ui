import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import * as dicomParser from "dicom-parser";
import { Image, Item } from "./types";
import { isDicom } from "./utils";
import { IUITreeNode } from "../../api/models/file-explorer.model";
import DicomHeader from "./DcmInfoPanel/DcmInfoPanel";

cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneFileImageLoader.external.cornerstone = cornerstone;
cornerstoneWebImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

cornerstoneTools.init({
  globalToolSyncEnabled: true,
});
cornerstoneTools.external.Hammer = Hammer;

type AllProps = {
  imageArray: IUITreeNode[];
  runTool: (ref: any) => void;
  handleToolbarAction: (action: string) => void;
};

// Description: Will be replaced with a DCM File viewer
class DcmImageSeries extends React.Component<AllProps> {
  _isMounted = false;
  private containerRef: React.RefObject<HTMLInputElement>;
  private items: Item[];
  private _shouldScroll: boolean;

  constructor(props: AllProps) {
    super(props);

    this.containerRef = React.createRef();
    this.items = [];
    this._shouldScroll = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.props.runTool(this);
    if (this.props.imageArray.length > 0) {
      const element = this.containerRef.current;
      if (element) {
        this._shouldScroll = true;
        element.addEventListener("wheel", this.handleMouseScroll);
      }
      this.displayImageFromFiles(0);
    }
  }

  componentDidUpdate(prevProps: AllProps) {
    if (prevProps.imageArray.length !== this.props.imageArray.length) {
      const element = this.containerRef.current;
      if (element) {
        this._shouldScroll = true;
        element.addEventListener("wheel", this.handleMouseScroll);
      }
      this.displayImageFromFiles(0);
    }
  }

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
        <DicomHeader handleToolbarAction={this.props.handleToolbarAction} />
        <div className="ami-viewer">
          <div ref={this.containerRef} id="container" />
          <canvas className="cornerstone-canvas" />
        </div>
      </React.Fragment>
    );
  }

  runTool = (toolName: string, opt?: any) => {
    console.log("ToolName", toolName);
    switch (toolName) {
      case "openImage": {
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
    }
  };

  enableTool = () => {
    const WwwcTool = cornerstoneTools.WwwcTool;
    const PanTool = cornerstoneTools.PanTool;
    const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
    const ZoomTool = cornerstoneTools.ZoomTool;
    const MagnifyTool = cornerstoneTools.MagnifyTool;

    cornerstoneTools.addTool(MagnifyTool);
    cornerstoneTools.addTool(WwwcTool);
    cornerstoneTools.addTool(PanTool);
    cornerstoneTools.addTool(ZoomTouchPinchTool);
    cornerstoneTools.addTool(ZoomTool);
  };

  displayImageFromFiles = async (index: number) => {
    const { imageArray } = this.props;
    if (imageArray.length < 0) return;
    const element = this.containerRef.current; // console.log("initialize AMI", this.state, container);
    if (!!element) {
      cornerstone.enable(element);
      const item = imageArray[index];
      let imageId: string = "";
      if (isDicom(item.module)) {
        const file = await item.file.getFileBlob();
        imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      } else {
        const file = await item.file.getFileBlob();
        imageId = cornerstoneFileImageLoader.fileManager.add(file);
      }
      cornerstone.loadImage(imageId).then((image: Image) => {
        cornerstone.displayImage(element, image);
        this.enableTool();
      });
    }
  };

  // Destroy Methods
  componentWillUnmount() {
    this._isMounted = false;
    cornerstone.disable(this.containerRef.current);
  }
}

export default DcmImageSeries;
