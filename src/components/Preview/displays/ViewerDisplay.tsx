import * as React from "react";
import { IFileBlob } from "../../../api/model";
import {
  CatchallDisplay,
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  PdfDisplay,
  XtkDisplay,
  TextDisplay,
  NiiVueDisplay,
  VideoDisplay,
} from "./index";
import { ActionState } from "../FileDetailView";

const components = {
  JsonDisplay,
  IframeDisplay,
  ImageDisplay,
  DcmDisplay,
  CatchallDisplay,
  PdfDisplay,
  XtkDisplay,
  TextDisplay,
  NiiVueDisplay,
  VideoDisplay,
};

interface ViewerDisplayProps {
  viewerName: string;
  fileItem: IFileBlob;
  preview?: string;
  actionState: ActionState;
}

const ViewerDisplay: React.FC<ViewerDisplayProps> = (
  props: ViewerDisplayProps,
) => {
  const Component = (components as any)[props.viewerName || "CatchallDisplay"];

  return <Component {...props} />;
};

export default ViewerDisplay;
