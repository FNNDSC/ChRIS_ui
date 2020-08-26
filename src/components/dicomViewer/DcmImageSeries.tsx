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
  handleOnToolbarAction: (action: string) => void;
};
interface IState {}
// Description: Will be replaced with a DCM Fyle viewer
class DcmImageSeries extends React.Component<AllProps, IState> {
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
        this.props.handleOnToolbarAction("next");
      } else if (e.deltaY < 0) this.props.handleOnToolbarAction("previous");
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="ami-viewer">
          <div ref={this.containerRef} id="container" />
          <canvas className="cornerstone-canvas" />
        </div>
      </React.Fragment>
    );
  }

  runTool = (toolName: string, opt: any) => {
    switch (toolName) {
      case "openImage": {
        this.displayImageFromFiles(opt);
      }
    }
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
        let stack = {
          imageIds: [imageId],
          currentImageIdIndex: index,
        };
        cornerstone.displayImage(element, image);
        cornerstoneTools.addStackStateManager(element, ["stack"]);
        cornerstoneTools.addToolState(element, "stack", stack);
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
