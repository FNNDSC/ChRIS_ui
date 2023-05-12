import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";

const initialState: IExplorerState = {
  selectedFile: undefined,
};

const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    case ExplorerActionTypes.SET_SELECTED_FILE: {
      const { selectedFile, selectedPlugin } = action.payload;
      return {
        ...state,
        selectedFile: {
          ...state.selectedFile,
          [selectedPlugin.data.id]: selectedFile,
        },
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
