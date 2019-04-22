import { action } from "typesafe-actions";
import { GalleryActionTypes, IGalleryState } from "./types";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";
import { IFileBlob } from "../../api/models/file-viewer.model";

// Description: Stores the current parent folder of the selected file when displaying gallery style displays for next, prev, play, others functionalities
export const initializeGallery = (gallery: IGalleryState) => action(GalleryActionTypes.INITIALIZE_GALLERY, gallery);
export const initializeGallerySuccess = (gallery: IGalleryState) => action(GalleryActionTypes.INITIALIZE_GALLERY_SUCCESS, gallery);

export const setGalleryActiveItem = (item: IGalleryItem) => action(GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM, item);
export const resetGalleryActiveItem = () => action(GalleryActionTypes.RESET_GALLERY_ACTIVE_ITEM);
export const setGalleryFile = (file: IFileBlob) => action(GalleryActionTypes.SET_GALLERY_FILE, file);
export const setGalleryItems = (items: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS, items);
export const resetGalleryItems = () => action(GalleryActionTypes.RESET_GALLERY_ITEMS);
