import { Reducer } from "redux";
import { ExplorerActionTypes, IExplorerState } from "./types";

// Type-safe initialState
const initialState: IExplorerState = {
  explorer: undefined,
  selectedNode: undefined
};

// Description: Handle File explorer state
const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    // Description: Set the explorer object:
    case ExplorerActionTypes.SET_EXPLORER_REQUEST: {
      return { ...state, explorer: action.payload };
    }
    case ExplorerActionTypes.SET_SELECTED_NODE: {
      return { ...state, selectedNode: action.payload };
    }
    default: {
      return state;
    }
  }
};

export { reducer as explorerReducer };
