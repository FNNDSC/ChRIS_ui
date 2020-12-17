import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import { IGalleryItem } from "../../../api/models/gallery.model";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  PdfDisplay,
} from "./index";

type AllProps = {
  tag: string;
  fileItem: IGalleryItem | IFileBlob;
  galleryItems?: IGalleryItem[];
};

class ViewerDisplay extends React.Component<AllProps> {
  components = {
    JsonDisplay,
    IframeDisplay,
    ImageDisplay,
    DcmDisplay,
    CatchallDisplay,
    PdfDisplay,
  };
  render() {
    const TagName = (this.components as any)[
      this.props.tag || "CatchallDisplay"
    ];
    return <TagName {...this.props} />;
  }
}
export default React.memo(ViewerDisplay);
