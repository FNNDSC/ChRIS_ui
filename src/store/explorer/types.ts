/*
*  File:            explorer/types.ts
*  Description:     Holds types and constants for managing Chris API file explorer
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IUITreeNode } from "../../api/models/file-explorer";
import { IGalleryItem } from "../../api/models/gallery.model";

// Description state for main user items[] and item
export interface IExplorerState {
    explorer: IUITreeNode;
    selectedFile?: IUITreeNode;
    selectedFolder?: IUITreeNode;
    galleryItems?: IGalleryItem[];
}

export const ExplorerActionTypes = keyMirror({
    SET_EXPLORER_REQUEST: null,
    SET_SELECTED_FILE: null,
    SET_SELECTED_FOLDER: null,
    SET_GALLERY_ITEMS: null,
    RESET_GALLERY_ITEMS: null
});
