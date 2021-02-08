import { IUITreeNode } from "../../../../api/models/file-explorer.model";
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import { PluginStatus } from "../../../../store/plugin/types";
import { Logs } from "../../../../store/feed/types";

export interface PluginStatusProps {
  pluginStatus?: PluginStatus[];
  pluginLog?: Logs;
  selected?: PluginInstance;
}

export interface FileBrowserProps {
  hasNext?: boolean;
  pluginLog?: Logs;
  selectedFiles?: FeedFile[];
  root: IUITreeNode;
  pluginName?: string;
  handleFileBrowserToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
  handleFileViewerToggle: (file: IUITreeNode, directory: IUITreeNode) => void;
  downloadAllClick: () => void;
}

export interface FileBrowerState {
  directory: IUITreeNode;
  breadcrumbs: IUITreeNode[];
  previewingFile?: IUITreeNode; // file selected for preview
  pathViewingFile?: IUITreeNode; // file selected via shift-click for viewing full path
}


export interface Label {
  [key: string]: boolean;
}


export type ComputeLog = {
  d_ret?: {
    l_logs?: string[];
  };
};