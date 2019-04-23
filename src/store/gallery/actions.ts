import { action } from "typesafe-actions";
import { GalleryActionTypes, IGalleryState } from "./types";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";
import { IFileBlob } from "../../api/models/file-viewer.model";
import { IUITreeNode } from "../../api/models/file-explorer.model";

// Description: sets and manage gallery - Stores the current parent folder of the selected file when displaying gallery style displays for next, prev, play, others functionalities
export const initializeGallery = (data: {selectedFile: IUITreeNode; selectedFolder: IUITreeNode; }) => action(GalleryActionTypes.INITIALIZE_GALLERY, data); // USED
export const destroyGallery = () => action(GalleryActionTypes.DESTROY_GALLERY);

// Description: sets and manage gallery active item
export const setGalleryActiveItem = (selectedFile: IUITreeNode) => action(GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM, selectedFile); // USED
export const setGalleryActiveItemSuccess = (galleryItem: IGalleryItem) => action(GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM_SUCCESS, galleryItem); // USED

// Description: sets gallery active items
export const setGalleryItems = (data: {selectedFile: IUITreeNode; selectedFolder: IUITreeNode; }) => action(GalleryActionTypes.SET_GALLERY_ITEMS, data); // USED
export const setGalleryItemsSuccess = (galleryItems: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS_SUCCESS, galleryItems);
// export const setGalleryItemsBlobs = (galleryItems: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS_BLOBS, galleryItems); // Set blobs use SET_GALLERY_ITEMS_SUCCESS
// export const resetGalleryItems = () => action(GalleryActionTypes.RESET_GALLERY_ITEMS);

