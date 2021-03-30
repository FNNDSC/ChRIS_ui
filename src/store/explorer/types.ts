/*
 *  File:            explorer/types.ts
 *  Description:     Holds types and constants for managing Chris API file explorer
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import { FeedFile } from "@fnndsc/chrisapi";
import keyMirror from "keymirror";


export type Key = string | number;

type FileInfo = {
  file?: FeedFile;
  fileSize: string;
};

interface TreeNode {
  checkable?: boolean;
  children: DataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  key: string | number;
  title: string;
  selectable?: boolean;
}

export interface EventDataNode {
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  loaded: boolean;
  loading: boolean;
  halfChecked: boolean;
  dragOver: boolean;
  dragOverGapTop: boolean;
  dragOverGapBottom: boolean;
  pos: string;
  active: boolean;
}

export type DataNode = TreeNode & FileInfo;
export type EventNode = EventDataNode & FileInfo;

export type Info = {
  event: "select";
  selected: boolean;
  node: EventNode;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
};

export type CheckInfo = {
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

// Description state for main user items[] and item
export interface IExplorerState {
  explorer?: DataNode[];
  selectedFile?: DataNode;

  viewerMode: boolean;
}

export const ExplorerActionTypes = keyMirror({
  SET_EXPLORER_REQUEST: null,
  SET_SELECTED_FILE: null,
  SET_SELECTED_FOLDER: null,
  TOGGLE_VIEWER_MODE: null,
  DESTROY_EXPLORER: null,
});
