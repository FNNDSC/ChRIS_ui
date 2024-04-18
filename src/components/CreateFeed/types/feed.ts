import { Tag, PluginInstance } from "@fnndsc/chrisapi";
import { IUserState } from "../../../store/user/types";
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

export enum Types {
  ToggleWizard = "TOGGLE_WIZZARD",
  SetStep = "SET_STEP",
  FeedNameChange = "FEED_NAME_CHANGE",
  FeedDescriptionChange = "FEED_DESCRIPTION_CHANGE",
  TagsChange = "TAGS_CHANGE",
  SelectedConfig = "SELECTED_CONFIG",
  AddChrisFile = "ADD_ChRIS_FILE",
  RemoveChrisFile = "REMOVE_ChRIS_FILE",
  ResetChrisFile = "Reset_ChRIS_FILE",
  AddLocalFile = "ADD_LOCAL_FILE",
  RemoveLocalFile = "REMOVE_LOCAL_FILE",
  SelectPluginMeta = "SELECT_PLUGIN_META",
  SelectPluginFromMeta = "SELECT_PLUGIN_FROM_META",
  RequiredInput = "REQUIRED_INPUT",
  DropdownInput = "DROPDOWN_INPUT",
  DeleteInput = "DELETE_INPUT",
  ResetState = "RESET_STATE",
  SetProgress = "SET_PROGRESS",
  SetError = "SET_ERROR",
  SetProgressPercent = "SET_PROGRESS_PERCENT",
  SetComputeEnvironment = "SET_COMPUTE_ENVIRONMENT",
  SetFeedCreationState = "SET_FEED_CREATION_STATE",
}

type CreateFeedPayload = {
  [Types.ToggleWizard]: boolean;
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
    selectedConfig: string[];
  };
  [Types.AddChrisFile]: {
    file: string;
    checkedKeys: Key[];
  };
  [Types.RemoveChrisFile]: {
    file: string;
    checkedKeys: Key[];
  };
  [Types.ResetChrisFile]: boolean;
  [Types.AddLocalFile]: {
    files: File[];
  };
  [Types.RemoveLocalFile]: {
    filename: string;
  };

  [Types.ResetState]: boolean;
  [Types.SetProgress]: {
    value: number;
  };
  [Types.SetError]: {
    feedError: any;
  };
  [Types.SetFeedCreationState]: {
    status: string;
  };
};

export type CreateFeedActions =
  ActionMap<CreateFeedPayload>[keyof ActionMap<CreateFeedPayload>];

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
  localFiles: File[];
  isDataSelected: boolean;
}

export interface CreateFeedState {
  wizardOpen: boolean;
  step: number;
  data: CreateFeedData;
  selectedConfig: string[];
  uploadProgress: number;
  feedError: any;
  creatingFeedStatus: string;
}

export interface CreateFeedReduxProp {
  user?: IUserState;
  addFeed?: (feed: Feed) => void;
  getSelectedPlugin?: (item: PluginInstance) => void;
}

/**
 *
 *Types for the ChRIS File Select
 *
 */

export type Breadcrumb = {
  breadcrumb?: string;
};

export type EventNode = EventDataNode<any> & Breadcrumb;
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
