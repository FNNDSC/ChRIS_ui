import * as React from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneFileImageLoader from "cornerstone-file-image-loader";
import * as cornerstoneWebImageLoader from "cornerstone-web-image-loader";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import Hammer from "hammerjs";
import * as dicomParser from "dicom-parser";
import { DcmImageProps, DcmImageState } from "./types";
import "./amiViewer.scss";

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

class DcmImage extends React.Component<DcmImageProps, DcmImageState> {
  private containerRef: React.RefObject<HTMLInputElement>;
  constructor(props: DcmImageProps) {
    super(props);
    this.containerRef = React.createRef();
  }

  state = {
    viewport: cornerstone.getDefaultViewport(null, undefined),
    stack: {
      imageId: [],
      currentImageIdIndex: 0,
    },
  };

  componentDidMount() {
    const { file } = this.props;
    if (!!file.blob) {
      this.initAmi(file.blob);
    }
  }

  render() {
    return (
      <div className="ami-viewer">
        <div ref={this.containerRef} id="container">
          <canvas className="cornerstone-canvas" />
        </div>
      </div>
    );
  }

  onWindowResize = () => {
    const element = this.containerRef.current;
    if (element) cornerstone.resize(element);
  };

  onImageRendered = () => {
    const element = this.containerRef.current;
    if (element) {
      const viewport = cornerstone.getViewport(element);
      this.setState({
        ...this.state,
        viewport,
      });
    }
  };

  onNewImage = () => {
    const element = this.containerRef.current;
    const enabledElement = cornerstone.getEnabledElement(element);
    this.setState({
      stack: {
        ...this.state.stack,
        imageId: enabledElement.image.imageId,
      },
    });
  };

  // Description: Run AMI CODE ***** working to be abstracted out
  initAmi = (file: Blob) => {
    const element = this.containerRef.current;
    let imageId = undefined;
    if (!!element) {
      cornerstone.enable(element);
      imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      this.setState(
        {
          stack: {
            ...this.state.stack,
            imageId: [imageId],
          },
        },
        () => {
          cornerstone
            .loadImage(this.state.stack.imageId[0])
            .then((image: any) => {
              cornerstone.displayImage(element, image);
              element.addEventListener(
                "cornerstoneimagerendered",
                this.onImageRendered
              );
            });
          window.addEventListener("resize", this.onWindowResize);
        }
      );
    }
  };

  componentWillUnmount() {
    const element = this.containerRef.current;
    if (!!element) {
      element.removeEventListener(
        "cornerstoneimagerendered",
        this.onImageRendered
      );
      window.removeEventListener("resize", this.onWindowResize);
      cornerstone.disable(element);
    }
  }
}

export default DcmImage;
