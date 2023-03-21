import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";

// Type-safe initialState
const initialState: IExplorerState = {
  selectedFile: undefined,
};

const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    case ExplorerActionTypes.SET_SELECTED_FILE: {
      const selectedFile = action.payload;
      return {
        ...state,
        selectedFile,
      };
    }

    case ExplorerActionTypes.CLEAR_SELECTED_FILE: {
      return {
        ...state,
        selectedFile: undefined,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as explorerReducer };
