import type * as React from "react";
import type { ActionState } from "../FileDetailView";
import {
  CatchallDisplay,
  DcmDisplay,
  IframeDisplay,
  ImageDisplay,
  JsonDisplay,
  NiiVueDisplay,
  PdfDisplay,
  TextDisplay,
  VideoDisplay,
  XtkDisplay,
} from "./index";
import type { FileBrowserFolderFile, PACSFile } from "@fnndsc/chrisapi";
import type { IFileBlob } from "../../../api/model";

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
  preview?: string;
  actionState: ActionState;
  selectedFile: FileBrowserFolderFile | PACSFile;
  list?: IFileBlob[];
}

const ViewerDisplay: React.FC<ViewerDisplayProps> = (
  props: ViewerDisplayProps,
) => {
  const Component = (components as any)[props.viewerName || "CatchallDisplay"];

  return <Component {...props} />;
};

export default ViewerDisplay;
