import { PluginInstance, FeedFile } from "@fnndsc/chrisapi";

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

type Return = {
  [key: string]: [boolean];
};

type Status = {
  [key: string]: boolean;
};

type Submit = {
  submit: boolean;
};

export interface PluginStatusLabels {
  pushPath: { [key: string]: boolean };
  compute: {
    [key: string]: Return & Status & Submit;
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
