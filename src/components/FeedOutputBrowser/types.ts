import { PluginInstance } from "@fnndsc/chrisapi";
import { DataNode } from "../../store/explorer/types";
import { ServerFilesPayload } from "../../store/resources/types";

export interface FileBrowserProps {
  pluginFilesPayload: {
    error: any;
    path: string;
  } & ServerFilesPayload;
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
