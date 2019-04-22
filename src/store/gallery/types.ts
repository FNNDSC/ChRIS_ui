/*
*  File:            gallery/types.ts
*  Description:     Holds types and constants for managing Chris API file gallery
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IGalleryItem } from "../../api/models/gallery.model";
import { IFileBlob } from "../../api/models/file-viewer.model";

// Description state for main user items[] and item
export interface IGalleryState {
    galleryItems: IGalleryItem[];
    galleryItem?: IGalleryItem;
}

export interface IGalleryToolbarState {
    isFullscreen: boolean;
    isPlaying: boolean;
}

export const GalleryActionTypes = keyMirror({
    INITIALIZE_GALLERY: null,
    INITIALIZE_GALLERY_SUCCESS: null,
    SET_GALLERY_FILE: null,
    SET_GALLERY_ACTIVE_ITEM: null,
    RESET_GALLERY_ACTIVE_ITEM: null,
    SET_GALLERY_ITEMS: null,
    SET_GALLERY_ITEMS_SUCCESS: null,
    SET_GALLERY_ITEMS_BLOBS: null,
    SET_GALLERY_ITEMS_BLOBS_SUCCESS: null,
    RESET_GALLERY_ITEMS: null,
    DESTROY_GALLERY: null
});
