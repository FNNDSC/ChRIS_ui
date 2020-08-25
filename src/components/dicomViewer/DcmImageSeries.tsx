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
import {
  getDicomPatientName,
  getDicomStudyId,
  getDicomStudyDate,
  getDicomStudyTime,
  getDicomStudyDescription,
  getDicomSeriesDate,
  getDicomSeriesTime,
  getDicomSeriesDescription,
  getDicomSeriesNumber,
  getDicomInstanceNumber,
  getDicomSliceLocation,
  getDicomSliceDistance,
  getDicomRows,
  getDicomColumns,
  getDicomEchoNumber,
  dicomDateTimeToLocale,
} from "./utils";

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
  imageArray: Blob[];
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
        console.log("Here");
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

  displayImageFromFiles = (index: number) => {
    const { imageArray } = this.props;
    if (imageArray.length < 0) return;
    const element = this.containerRef.current; // console.log("initialize AMI", this.state, container);
    if (!!element) {
      cornerstone.enable(element);
      const file = imageArray[index];
      let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      cornerstone.loadImage(imageId).then((image: Image) => {
        const patientName = getDicomPatientName(image);
        const studyId = getDicomStudyId(image);
        const studyDate = getDicomStudyDate(image);
        const studyTime = getDicomStudyTime(image);
        const studyDescription = getDicomStudyDescription(image);

        const seriesDate = getDicomSeriesDate(image);
        const seriesTime = getDicomSeriesTime(image);
        const seriesDescription = getDicomSeriesDescription(image);
        const seriesNumber = getDicomSeriesNumber(image);

        const instanceNumber = getDicomInstanceNumber(image);
        const sliceDistance = getDicomSliceDistance(image);
        const echoNumber = getDicomEchoNumber(image);
        const sliceLocation = getDicomSliceLocation(image);
        const columns = getDicomColumns(image);
        const rows = getDicomRows(image);
        const studyDateTime =
          studyDate === undefined
            ? undefined
            : dicomDateTimeToLocale(`${studyDate}.${studyTime}`);

        let item: Item = {
          imageId: imageId,
          instanceNumber: instanceNumber,
          name: "test",
          image: image,
          rows: rows,
          columns: columns,
          sliceDistance: sliceDistance,
          sliceLocation: sliceLocation,
          patient: {
            patientName: patientName,
          },
          study: {
            studyId: studyId,
            studyDate: studyDate,
            studyTime: studyTime,
            studyDateTime: studyDateTime,
            studyDescription: studyDescription,
          },
          series: {
            seriesDate: seriesDate,
            seriesTime: seriesTime,
            seriesDescription: seriesDescription,
            seriesNumber: seriesNumber,
            echoNumber: echoNumber,
          },
        };
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
  }
}

export default DcmImageSeries;
