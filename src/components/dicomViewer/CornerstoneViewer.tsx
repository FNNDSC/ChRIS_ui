import * as React from "react";
import { Link } from "react-router-dom";
import { HomeIcon } from "@patternfly/react-icons";
import * as cornerstone from "cornerstone-core";
import FeedFileModel, { IFeedFile } from "../../api/models/feed-file.model";
import { IFileState, getFileExtension } from "../../api/models/file-explorer";
import "./amiViewer.scss";
import { image108Base64, image109Base64 } from "./sampleImage";

type AllProps = {
  files: IFeedFile[];
};

// Description: Will be replaced with a DCM Fyle viewer
class CSViewer extends React.Component<AllProps, IFileState> {
  dynamicImagePixelData: string | ArrayBuffer | null = null;
  constructor(props: AllProps) {
    super(props);
    const { files } = this.props;
    const tempUrl =
    "http://fnndsc.childrens.harvard.edu:8001/api/v1/plugins/instances/files/101/0101-1.3.12.2.1107.5.2.32.35201.2013101416341221810103029.dcm";
    this.fetchData(tempUrl);
  }

  state = {
    blob: undefined,
    blobName: "",
    blobText: null,
    fileType: ""
  };
  // Description: Fetch blob and read it into state to display preview
  fetchData(file_resource: string) {
    FeedFileModel.getFileBlob(file_resource).then((result: any) => {
      const _self = this;
      const fileType = getFileExtension(
        "0001-1.3.12.2.1107.5.2.32.35201.2013101416335447259100817.dcm"
      );
      this.setState({ blob: result.data, blobName: "temp", fileType });
      if (!!result.data) {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            _self.setState({ blobText: reader.result });
          },
          false
        );
        reader.readAsDataURL(result.data); //  reader.readAsDataURL(file);
      }
    });
  }

  render() {
    // Register the url scheme 'dcmImageLoader' to correspond to our loadImage function
    cornerstone.registerImageLoader("dcmImageLoader", this.getExampleImage);
    if (!!this.state.blobText) {
      // console.log(this.state.blobText);
      const dynamicImage = (this.state.blobText as any).replace("data:*/*;base64,", "");
      this.dynamicImagePixelData = this.getPixelData(dynamicImage);
      const imageId = "dcmImageLoader://1";
      const element = document.getElementById("dicomImage");
      if (!!element) {
        cornerstone.enable(element);
        // Images loaded as follows will be passed to our loadImage function:
        cornerstone.loadImage(imageId).then((image: any) => {
          // console.log(image);
          cornerstone.displayImage(element, image);
        });
      }
    }

    return (
      <div className="ami-viewer">
        <h1 className="pf-u-mb-lg">
          <Link to={`/`} className="pf-u-mr-lg">
            <HomeIcon />
          </Link>{" "}
          Ami Viewer: {this.props.files.length} files
        </h1>
        <div id="dicomImage" />
      </div>
    );
  }

  str2ab = (str: string) => {
    const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    let index: number = 0;
    for (let i = 0, strLen = str.length; i < strLen; i += 2) {
      const lower = str.charCodeAt(i);
      const upper = str.charCodeAt(i + 1);
      // tslint:disable-next-line:no-bitwise
      bufView[index] = lower + (upper << 8);
      index++;
    }
    return bufView;
  };

  /// This will be moved out to a class ***** Working
  getPixelData = (base64PixelData: any) => {
    const pixelDataAsString = window.atob(base64PixelData);
    const pixelData = this.str2ab(pixelDataAsString);
    return pixelData;
  };

  image1PixelData = this.getPixelData(image108Base64);
  // image1PixelData = this.getPixelData(test);
  image2PixelData = this.getPixelData(image109Base64);

  getExampleImage = (imageId: string) => {
    const width = 256;
    const height = 256;
    const _self = this;
    function getPixelData() {
      if (imageId === "dcmImageLoader://1") {
       // return _self.dynamicImagePixelData;
       return _self.image1PixelData;
      }

      throw new Error("unknown imageId");
    }

    const image = {
      imageId,
      minPixelValue: 0,
      maxPixelValue: 257,
      slope: 1.0,
      intercept: 0,
      windowCenter: 127,
      windowWidth: 256,
      getPixelData,
      rows: height,
      columns: width,
      height,
      width,
      color: false,
      columnPixelSpacing: 0.8984375,
      rowPixelSpacing: 0.8984375,
      sizeInBytes: width * height * 2
    };

    return {
      promise: new Promise((resolve: any) => {
        resolve(image);
      }),
      cancelFn: undefined
    };
  };
}


export default CSViewer;
