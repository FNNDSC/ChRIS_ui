import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";
import GalleryModel from "../../api/models/gallery.model";

// Type-safe initialState
const initialState: IExplorerState = {
  explorer: { module: "", uiId: "" },
  selectedFile: undefined,
  selectedFolder: undefined,
  viewerMode: false,
  isViewerModeDicom: true,
};

// Description: Handle File explorer state
const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    // Description: Set the explorer object:
    case ExplorerActionTypes.SET_EXPLORER_REQUEST: {
      return {
        ...state,
        explorer: action.payload,
      };
    }
    case ExplorerActionTypes.SET_SELECTED_FILE: {
     
      const selectedFile = action.payload.selectedFile,
        isViewerModeDicom = GalleryModel.isDicomFile(selectedFile.module);
      return {
        ...state,
        selectedFile,
        isViewerModeDicom,
        selectedFolder: action.payload.selectedFolder,
      };
    }
    case ExplorerActionTypes.SET_SELECTED_FOLDER: {
      return {
        ...state,
        selectedFolder: action.payload,
        selectedFile: undefined,
      };
    }
    case ExplorerActionTypes.TOGGLE_VIEWER_MODE: {
      return { ...state, viewerMode: action.payload };
    }
    case ExplorerActionTypes.DESTROY_EXPLORER: {
      return { ...state, ...initialState };
    }

    default: {
      return state;
    }
  }
};

export { reducer as explorerReducer };
