import { FeedFile } from "@fnndsc/chrisapi";
import { DataNode } from "../../../../store/explorer/types";


export interface FileBrowserProps {
  selectedFiles?: FeedFile[];
  root: DataNode;
  pluginName?: string;
  handleFileBrowserToggle: () => void;
  handleFileViewerToggle: () => void;
  downloadAllClick: () => void;
  expandDrawer: (panel: string) => void;
}

export interface FileBrowserState {
  directory: DataNode;
  breadcrumbs: DataNode[];
  currentFile: DataNode[];
  previewingFile?: DataNode; // file selected for preview
}

export interface Label {
  [key: string]: boolean;
}
