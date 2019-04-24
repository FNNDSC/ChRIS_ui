import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";

// Type-safe initialState
const initialState: IExplorerState = {
  explorer: {module: "", uiId: ""},
  selectedFile: undefined,
  selectedFolder: undefined
};

// Description: Handle File explorer state
const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    // Description: Set the explorer object:
    case ExplorerActionTypes.SET_EXPLORER_REQUEST: {
      return {
        ...state,
        explorer: action.payload,
        selectedFolder: action.payload
      };
    }
    case ExplorerActionTypes.SET_SELECTED_FILE: {
      return {...state, selectedFile: action.payload.selectedFile, selectedFolder: action.payload.selectedFolder };
    }
    case ExplorerActionTypes.SET_SELECTED_FOLDER: {
      return {...state, selectedFolder: action.payload, selectedFile: undefined };
    }
    case ExplorerActionTypes.DESTROY_EXPLORER: {
      return { ...state, selectedFile: undefined, selectedFolder: undefined };
    }

    default: {
      return state;
    }
  }
};

export { reducer as explorerReducer };
