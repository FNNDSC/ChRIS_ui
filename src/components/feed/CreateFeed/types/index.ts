import { Tag, Plugin, PluginInstance } from "@fnndsc/chrisapi";
import { InputState, InputIndex } from "../../AddNode/types";
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
    file: EventNode;
    path: string;
    checkedKeys: CheckedKeys;
  };
  [Types.RemoveChrisFile]: {
    file: EventNode;
    checkedKeys: CheckedKeys;
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
  [Types.DeleteInput]: {
    input: string;
  };
  [Types.ResetState]: boolean;
  [Types.SetProgress]: {
    feedProgress: "string";
  };
  [Types.SetError]: {
    feedError: string;
  };
  [Types.ResetProgress]: boolean;
};

export type CreateFeedActions = ActionMap<CreateFeedPayload>[keyof ActionMap<
  CreateFeedPayload
>];

export interface LocalFile {
  name: string;
  blob: object;
}

export interface CreateFeedData {
  feedName: string;
  feedDescription: string;
  tags: Tag[];
  chrisFiles: EventNode[];
  checkedKeys: CheckedKeys;
  localFiles: LocalFile[];
  path: string;
}

export interface CreateFeedState extends InputState {
  wizardOpen: boolean;
  step: number;
  data: CreateFeedData;
  selectedConfig: string;
  selectedPlugin?: Plugin;
  feedProgress: string;
  feedError: string;
  value: number;
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
