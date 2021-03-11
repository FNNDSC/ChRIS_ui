import { IUITreeNode } from "../../../../api/models/file-explorer.model";
import { FeedFile } from "@fnndsc/chrisapi";

export interface FileBrowserProps {
  selectedFiles?: FeedFile[];
  root: IUITreeNode;
  pluginName?: string;
  handleFileBrowserToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
  handleFileViewerToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
  downloadAllClick: () => void;
}

export interface FileBrowserState {
  directory: IUITreeNode;
  breadcrumbs: IUITreeNode[];
  previewingFile?: IUITreeNode; // file selected for preview
  pathViewingFile?: IUITreeNode; // file selected via shift-click for viewing full path
}


export interface Label {
  [key: string]: boolean;
}


