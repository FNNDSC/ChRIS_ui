import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
  PluginInstance,
} from "@fnndsc/chrisapi";
import type { DataNode } from "../../store/explorer/types";

export interface FilesPayload {
  folderFiles: FileBrowserFolderFile[];
  children: any[];
  linkFiles: FileBrowserFolderLinkFile[];
  folderList?: FileBrowserFolderList;
  path: string;
}

export interface FileBrowserProps {
  pluginFilesPayload: FilesPayload;
  handleFileClick: (path: string) => void;
  selected: PluginInstance;
  filesLoading: boolean;
  currentPath: string;
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
