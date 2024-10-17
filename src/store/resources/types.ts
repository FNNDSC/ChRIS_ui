/*
 *  File:            resources/types.ts
 *  Description:     Holds types and constants for managing polling plugin instances
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */

import type {
  PluginInstance,
  FileBrowserFolderLinkFile,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";

type Return = {
  status: boolean;
  job_status: string;
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

export interface PluginInstanceStatusPayload {
  [id: string]: {
    status: string;
  };
}

export interface PluginStatus {
  id: number;
  title: string;
  status: boolean;
  isCurrentStep: boolean;
  error: boolean;
  icon: any;
}

export interface Logs {
  [key: string]: {
    logs: string;
  };
}

export interface ResourcePayload {
  pluginStatus?: PluginStatus[];
  pluginLog?: Logs;
}

export interface FilesPayload {
  [id: string]: {
    folderFiles: FileBrowserFolderFile[];
    children: any[];
    linkFiles: FileBrowserFolderLinkFile[];
    error: any;
    path: string;
  };
}

export interface PluginInstanceResourcePayload {
  [id: string]: ResourcePayload;
}

export interface PluginInstanceObj {
  selected: PluginInstance;
  pluginInstances: PluginInstance[];
}

export interface NodeDetailsProps {
  selected?: PluginInstance;
  pluginInstanceResource?: ResourcePayload;
  text?: string;
}

export interface DestroyActiveResources {
  data?: PluginInstance[];
  selectedPlugin?: PluginInstance;
}

export interface IResourceState {
  pluginInstanceStatus: PluginInstanceStatusPayload;
  pluginInstanceResource: PluginInstanceResourcePayload;
}
