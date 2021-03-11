import { FeedFile } from "@fnndsc/chrisapi";

export type TreeNode = {
  file: FeedFile;
  title: string;
  children: TreeNode[];
};

export interface FileBrowserProps {
  selectedFiles?: FeedFile[];
  root: TreeNode;
  pluginName?: string;
  handleFileBrowserToggle: (file: TreeNode, directory: TreeNode) => void;
  handleFileViewerToggle: (file: TreeNode, directory: TreeNode) => void;
  downloadAllClick: () => void;
}

export interface FileBrowserState {
  directory: TreeNode;
  breadcrumbs: TreeNode[];
  previewingFile?: TreeNode; // file selected for preview
  pathViewingFile?: TreeNode; // file selected via shift-click for viewing full path
}

export interface Label {
  [key: string]: boolean;
}
