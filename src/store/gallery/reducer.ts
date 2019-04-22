import { Reducer } from "redux";
import { GalleryActionTypes, IGalleryState } from "./types";
import { IGalleryItem } from "../../api/models/gallery.model";

const initialState: IGalleryState = {
  galleryItem: undefined,
  galleryItems: []
};

// Description: Handle File explorer state
const reducer: Reducer<IGalleryState> = (state = initialState, action) => {
  switch (action.type) {
    case GalleryActionTypes.INITIALIZE_GALLERY: {
      console.log("INITIALIZE_GALLERY", action.payload)
      return { ...state, galleryItem: action.payload.galleryItem, galleryItems: action.payload.galleryItems };
    }
    case GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM: {
      return { ...state, galleryItem: action.payload };
    }
    case GalleryActionTypes.RESET_GALLERY_ACTIVE_ITEM: {
      return { ...state, galleryItem: undefined };
    }
    case GalleryActionTypes.SET_GALLERY_ITEMS: {
      return { ...state, galleryItems: action.payload };
    }
    case GalleryActionTypes.RESET_GALLERY_ITEMS: {
      return { ...state, galleryItems: [] };
    }
    default: {
      return state;
    }
  }
};

export { reducer as galleryReducer };
