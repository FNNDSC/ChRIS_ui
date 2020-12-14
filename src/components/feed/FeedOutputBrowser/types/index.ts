import { IUITreeNode } from "../../../../api/models/file-explorer.model";
import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";
import { PluginStatus } from "../../../../store/plugin/types";
import {
  FilesPayload,
  PluginInstanceResourcePayload,
} from "../../../../store/feed/types";


export interface PluginStatusProps {
  pluginStatus?: PluginStatus[];
  pluginLog?: {};
  selected?: PluginInstance;
}



export interface FileBrowserProps {
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

type Return = {
  l_logs: any[];
  l_status: string[];
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
