import * as React from "react";
import brainImgPlaceholder from "../../assets/images/image-ph-frame118.png";
import brainImg3dPlaceholder from "../../assets/images/fs3Dsample.png";
import { IFeedFile } from "../../api/models/feed-file.model";
type AllProps = {
  blob?: Blob;
  blobName: string;
  blobText: any;
  fileType: string;
};

// Description: Will be replaced with a DCM Fyle viewer
class AmiViewer extends React.Component<AllProps> {


  render() {
    const {blobName} = this.props;
    return <div className="ami-viewer pf-u-px-lg">{blobName}</div>;
  }
}

export default AmiViewer;
