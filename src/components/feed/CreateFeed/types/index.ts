import { Tag, Plugin, PluginInstance, PluginPiping } from "@fnndsc/chrisapi";
import { InputState, InputIndex, InputType } from "../../AddNode/types";
import { IUserState } from "../../../../store/user/types";
import { Feed } from "@fnndsc/chrisapi";
import { EventDataNode, DataNode, Key } from "rc-tree/lib/interface";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export interface ComputeEnvData {
  [key: string]: { computeEnvs: any[]; currentlySelected: any };
}

export enum Types {
  ToggleWizzard = "TOGGLE_WIZZARD",
  SetStep = "SET_STEP",
  FeedNameChange = "FEED_NAME_CHANGE",
  FeedDescriptionChange = "FEED_DESCRIPTION_CHANGE",
  TagsChange = "TAGS_CHANGE",
  SelectedConfig = "SELECTED_CONFIG",
  AddChrisFile = "ADD_ChRIS_FILE",
  RemoveChrisFile = "REMOVE_ChRIS_FILE",
  AddLocalFile = "ADD_LOCAL_FILE",
  RemoveLocalFile = "REMOVE_LOCAL_FILE",
  SelectPlugin = "SELECT_PLUGIN",
  RequiredInput = "REQUIRED_INPUT",
  DropdownInput = "DROPDOWN_INPUT",
  DeleteInput = "DELETE_INPUT",
  ResetState = "RESET_STATE",
  SetProgress = "SET_PROGRESS",
  SetError = "SET_ERROR",
  ResetProgress = "RESET_PROGRESS",
  SetProgressPercent = "SET_PROGRESS_PERCENT",
  SetComputeEnvironment = "SET_COMPUTE_ENVIRONMENT",
  SetCurrentPipeline = "SET_CURRENT_PIPELINE",
  SetPipelineResources = "SET_PIPELINE_RESOURCES",
  SetPipelines = "SET_PIPELINES",
  SetPipelineEnvironments = "SET_PIPELINE_ENVIRONMENTS",
  SetCurrentNode = "SET_CURRENT_NODE",
  SetExpandedPipelines = "SET_EXPANDED_PIPELINES",
  AddPipeline = "ADD_PIPELINE",
  SetPipelineName = "SET_PIPELINE_NAME",
  DeslectPipeline = "DESELECT_PIPELINE",
  SetCurrentNodeTitle = "SET_CURRENT_NODE_TITLE",
  SetCurrentComputeEnvironment = "SET_CURRENT_COMPUTE_ENVIRONMENT",
  SetPipelineDropdownInput = "SET_PIPELINE_DROPDOWN_INPUT",
  SetPipelineRequiredInput = "SET_PIPELINE_REQUIRED_INPUT",
  DeletePipelineInput = "DELETE_PIPELINE_INPUT",
  SetDefaultParameters = "SET_DEFAULT_PARAMETERS",
}

type CreateFeedPayload = {
  [Types.ToggleWizzard]: boolean;
  [Types.SetStep]: {
    id: number;
  };
  [Types.FeedNameChange]: {
    value: string;
  };
  [Types.FeedDescriptionChange]: {
    value: string;
  };
  [Types.TagsChange]: {
    tags: Tag[];
  };
  [Types.SelectedConfig]: {
    selectedConfig: string;
  };
  [Types.AddChrisFile]: {
    file: string;
    checkedKeys: Key[];
  };
  [Types.RemoveChrisFile]: {
    file: string;
    checkedKeys: Key[];
  };
  [Types.AddLocalFile]: {
    files: LocalFile[];
  };
  [Types.RemoveLocalFile]: {
    filename: string;
  };
  [Types.SelectPlugin]: {
    plugin: Plugin;
    checked: boolean;
  };
  [Types.DropdownInput]: {
    id: string;
    input: InputIndex;
  };
  [Types.RequiredInput]: {
    id: string;
    input: InputIndex;
  };

  [Types.SetPipelineDropdownInput]: {
    currentNodeId: string;
    currentPipelineId: string;
    id: string;
    input: InputIndex;
  };
  [Types.SetPipelineRequiredInput]: {
    currentNodeId: string;
    currentPipelineId: string;
    id: string;
    input: InputIndex;
  };

  [Types.DeleteInput]: {
    input: string;
  };

  [Types.DeletePipelineInput]: {
    input: string;
    currentPipelineId: number;
    currentNodeId: number;
  };

  [Types.ResetState]: boolean;
  [Types.SetProgress]: {
    feedProgress: "string";
  };
  [Types.SetError]: {
    feedError: any;
  };
  [Types.SetProgressPercent]: {
    percent: number;
  };
  [Types.SetComputeEnvironment]: {
    computeEnvironment: string;
  };
  [Types.ResetProgress]: boolean;

  [Types.SetPipelineResources]: {
    pipelineId: number;
    parameters: any[];
    pluginPipings: PluginPiping[];
    pipelinePlugins: any[];
  };
  [Types.SetPipelineEnvironments]: {
    pipelineId: number;
    computeEnvData: {
      [key: string]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    };
  };
  [Types.SetCurrentNode]: {
    pipelineId: number;
    currentNode: number;
  };
  [Types.SetExpandedPipelines]: {
    pipelineId: number;
  };

  [Types.SetCurrentPipeline]: {
    pipelineId: number;
  };
  [Types.SetPipelines]: {
    pipelines: any[];
  };

  [Types.AddPipeline]: {
    pipeline: any;
  };

  [Types.SetPipelineName]: {
    pipelineName: string;
  };

  [Types.SetCurrentComputeEnvironment]: {
    computeEnv: {
      item: any;
      currentNode: number;
      currentPipelineId: string;
      computeEnvList: any[];
    };
  };

  [Types.SetCurrentNodeTitle]: {
    currentPipelineId: string;
    currentNode: number;
    title: string;
  };

  [Types.SetDefaultParameters]: {
    pipelineId: string;
    defaultParameters: [];
  };

  [Types.DeslectPipeline]: Record<string, unknown>;
};

export type CreateFeedActions =
  ActionMap<CreateFeedPayload>[keyof ActionMap<CreateFeedPayload>];

export interface LocalFile {
  name: string;
  blob: File;
}
export interface PACSData {
  id: number;
  creation_date: string;
  fname: string;
  PatientID: string;
  PatientName: string;
  PatientBirthDate: string;
  PatientAge: number;
  PatientSex: string;
  StudyInstanceUID: string;
  StudyDescription: string;
  SeriesInstanceUID: string;
  SeriesDescription: string;
  StudyDate: string;
  Modality: string;
  pacs_identifier: string;
  ProtocolName: string;
}

export interface PACSFile {
  url: string;
  auth: {
    token: string;
  };
  contentType: string;
  collection: Record<string, unknown>;
  data: PACSData;
}

export interface CreateFeedData {
  feedName: string;
  feedDescription: string;
  tags: Tag[];
  chrisFiles: string[];
  checkedKeys: {
    [key: string]: Key[];
  };
  localFiles: LocalFile[];
  isDataSelected: boolean;
}

export interface PipelineData {
  [key: string]: {
    pluginParameters?: any[];
    defaultParameters?: any[];
    pluginPipings?: PluginPiping[];
    pipelinePlugins?: any[];
    computeEnvs?: ComputeEnvData;
    currentNode?: number;
    title: {
      [id: number]: string;
    };
    input: {
      [id: string]: {
        dropdownInput: InputType;
        requiredInput: InputType;
      };
    };
  };
}

export interface CreateFeedState extends InputState {
  wizardOpen: boolean;
  step: number;
  data: CreateFeedData;
  selectedConfig: string;
  selectedPlugin?: Plugin;
  feedProgress: string;
  feedError: any;
  value: number;
  computeEnvironment: string;
  pipelineData: PipelineData;
  pipelineName: string;
  selectedPipeline?: number;
  pipelines: any[];
  currentlyConfiguredNode: string;
}

export interface CreateFeedReduxProp {
  user?: IUserState;
  addFeed?: (feed: Feed) => void;
  getSelectedPlugin?: (item: PluginInstance) => void;
}

export interface ChrisFileSelectProp {
  username: string;
}

/**
 *
 *Types for the ChRIS File Select
 *
 */

export type Breadcrumb = {
  breadcrumb?: string;
};

export type EventNode = EventDataNode & Breadcrumb;
export type DataBreadcrumb = DataNode & Breadcrumb;
export type Info = {
  event: "check";
  node: EventNode;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: DataNode[];
  checkedNodesPositions?: {
    node: DataNode;
    pos: string;
  }[];
  halfCheckedKeys?: Key[];
};

export type CheckedKeys =
  | {
      checked: Key[];
      halfChecked: Key[];
    }
  | Key[];
