/*
*  File:            gallery/types.ts
*  Description:     Holds types and constants for managing Chris API file gallery
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";
import { IGalleryItem } from "../../api/models/gallery.model";

// Description state for main user items[] and item
export interface IGalleryState {
    galleryItems: IGalleryItem[];
    galleryItem?: IGalleryItem;
}

export const GalleryActionTypes = keyMirror({
    SET_GALLERY_ACTIVE_ITEM: null,
    RESET_GALLERY_ACTIVE_ITEM: null,
    SET_GALLERY_ITEMS: null,
    RESET_GALLERY_ITEMS: null
});
