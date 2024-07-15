import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  PluginInstance,
} from "@fnndsc/chrisapi";
import type { DataNode } from "../../store/explorer/types";

export interface FileBrowserProps {
  pluginFilesPayload: {
    folderFiles: FileBrowserFolderFile[];
    children: any[];
    linkFiles: FileBrowserFolderLinkFile[];
    error: any;
    path: string;
  };
  handleFileClick: (path: string) => void;
  selected: PluginInstance;
  filesLoading: boolean;
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
