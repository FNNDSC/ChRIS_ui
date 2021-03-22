import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";


// Type-safe initialState
const initialState: IExplorerState = {
  explorer: undefined,
  selectedFile: undefined,
  viewerMode: false,

};


const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    case ExplorerActionTypes.SET_EXPLORER_REQUEST: {
      return {
        ...state,
        explorer: action.payload,
      };
    }
    case ExplorerActionTypes.SET_SELECTED_FILE: {
      const selectedFile = action.payload;
      //const isDicom = GalleryModel.isValidFile(selectedFile.module);
      return {
        ...state,
        selectedFile,
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
