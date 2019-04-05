import * as React from "react";
import { Link } from "react-router-dom";
import brainImgPlaceholder from "../../assets/images/image-ph-frame118.png";
import brainImg3dPlaceholder from "../../assets/images/fs3Dsample.png";
import { IFeedFile } from "../../../api/models/feed-file.model";
import { HomeIcon } from "@patternfly/react-icons";
type AllProps = {
  files: IFeedFile[];
};

// Description: Will be replaced with a DCM Fyle viewer
class AmiViewer extends React.Component<AllProps> {
  render() {
    return (
      <div className="ami-viewer">
        <h1 className="pf-u-mb-lg"><Link to={`/`} className="pf-u-mr-lg"><HomeIcon /></Link> Ami Viewer</h1>
      </div>
    );
  }
}

export default AmiViewer;
