import * as React from "react";
import { IFileBlob } from "../../../api/models/file-viewer.model";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  PdfDisplay,
} from "./index";

const components = {
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  CatchallDisplay,
  PdfDisplay,
};

interface ViewerDisplayProps {
  viewerName: string;
  fileItem: IFileBlob;
}

const ViewerDisplay: React.FC<ViewerDisplayProps> = (
  props: ViewerDisplayProps
) => {
  const Component = (components as any)[props.viewerName || "CatchallDisplay"];

  return <Component {...props} />;
};

export default ViewerDisplay;
