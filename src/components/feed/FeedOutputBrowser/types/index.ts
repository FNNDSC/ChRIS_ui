import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import { IUITreeNode } from "../../../../api/models/file-explorer.model";

export interface PluginStatusProps {
  pluginStatus?: string;
  pluginLog?: {};
}

export interface FeedOutputBrowserProps {
  selected?: PluginInstance;
  plugins?: PluginInstance[];
  viewerMode?: boolean;
  pluginFiles?: { [pluginId: number]: FeedFile[] };
  pluginStatus?: string;
  pluginLog?: {};
  handlePluginSelect: Function;
  setSelectedFile: Function;
  getPluginFilesRequest: (selected: PluginInstance) => void;
  stopPolling: () => void;
  toggleViewerMode: (isViewerOpened: boolean) => void;
}

export interface FileBrowserProps {
  root: IUITreeNode;
  pluginName?: string;
  handleFileBrowserToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
  handleFileViewerToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
}

export interface FileBrowerState {
  directory: IUITreeNode;
  breadcrumbs: IUITreeNode[];
  previewingFile?: IUITreeNode; // file selected for preview
  pathViewingFile?: IUITreeNode; // file selected via shift-click for viewing full path
}

type Return = {
  l_logs: [];
  l_status: [];
  status: boolean;
};

type Submit = {
  status: boolean;
};

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    return: Return;
    status: boolean;
    submit: Submit;
  };
  swiftPut: { [key: string]: boolean };
  pullPath: { [key: string]: boolean };
}

export interface Label {
  [key: string]: boolean;
}
export interface Logs {
  [info: string]: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export interface LogStatus {
  [key: string]: {};
}
