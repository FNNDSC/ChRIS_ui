/*
*  File:            explorer/types.ts
*  Description:     Holds types and constants for managing Chris API file explorer
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IUITreeNode } from "../../api/models/file-explorer.model";


// Description state for main user items[] and item
export interface IExplorerState {
    explorer: IUITreeNode;
    selectedFile?: IUITreeNode;
    selectedFolder?: IUITreeNode;
    viewerMode: boolean;
    isViewerModeDicom: boolean;
}

export const ExplorerActionTypes = keyMirror({
    SET_EXPLORER_REQUEST: null,
    SET_SELECTED_FILE: null,
    SET_SELECTED_FOLDER: null,
    TOGGLE_VIEWER_MODE: null,
    DESTROY_EXPLORER: null
});
