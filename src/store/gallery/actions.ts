import { action } from "typesafe-actions";
import { GalleryActionTypes } from "./types";
import GalleryModel, { IGalleryItem } from "../../api/models/gallery.model";

// Description: Stores the current parent folder of the selected file when displaying gallery style displays for next, prev, play, others functionalities
export const setGalleryActiveItem = (item: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM, item);
export const resetGalleryActiveItem = () => action(GalleryActionTypes.RESET_GALLERY_ACTIVE_ITEM);

export const setGalleryItems = (items: IGalleryItem[]) => action(GalleryActionTypes.SET_GALLERY_ITEMS, items);
export const resetGalleryItems = () => action(GalleryActionTypes.RESET_GALLERY_ITEMS);
