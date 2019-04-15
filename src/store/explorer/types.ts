/*
*  File:            explorer/types.ts
*  Description:     Holds types and constants for managing Chris API file explorer
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IUITreeNode } from "../../api/models/file-explorer";

// Description state for main user items[] and item
export interface IExplorerState {
    explorer?: IUITreeNode;
    selectedNode?: IUITreeNode;
}

export const ExplorerActionTypes = keyMirror({
    SET_EXPLORER_REQUEST: null,
    SET_SELECTED_NODE: null,
});
