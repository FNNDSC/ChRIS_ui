import { Reducer } from "redux";
import { GalleryActionTypes, IGalleryState } from "./types";

const initialState: IGalleryState = {
  galleryItem: undefined,
  galleryItems: []
};

// Description: Handle File explorer state
const reducer: Reducer<IGalleryState> = (state = initialState, action) => {
  switch (action.type) {
    case GalleryActionTypes.SET_GALLERY_ACTIVE_ITEM_SUCCESS: {
      return { ...state, galleryItem: action.payload };
    }
    case GalleryActionTypes.SET_GALLERY_ITEMS_SUCCESS: {
      return { ...state, galleryItems: action.payload };
    }
    case GalleryActionTypes.DESTROY_GALLERY: {
      return { ...state, galleryItem: undefined, galleryItems: [] };
    }
    default: {
      return state;
    }
  }
};

export { reducer as galleryReducer };
