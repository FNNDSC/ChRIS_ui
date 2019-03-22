import { Reducer } from "redux";
import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  selected: undefined,
  descendants: undefined,
  files: [],
  explorer: undefined,
  parameters: []
};

// ***** NOTE: Working *****
const reducer: Reducer<IPluginState> = (state = initialState, action) => {
  switch (action.type) {
    case PluginActionTypes.GET_PLUGIN_FILES_SUCCESS: {
      return { ...state, files: action.payload.data.results };
    }
    // Description: Set the explorer object:
    case PluginActionTypes.SET_EXPLORER_SUCCESS: {
      return { ...state, explorer: action.payload };
    }
    case PluginActionTypes.GET_PLUGIN_PARAMETERS_SUCCESS: {
      return { ...state, parameters: action.payload.data.results };
    }
    case PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS: {
      const descendants = action.payload.data.results;
      const selected = !!action.payload.data.results &&
        action.payload.data.results.length &&
        action.payload.data.results[0];
      return { ...state, descendants, selected };
    }
    case PluginActionTypes.FETCH_ERROR: {
      return { ...state };
    }
    case PluginActionTypes.FETCH_COMPLETE: {
      return { ...state };
    }
    //  ***** Working *****
    default: {
      return state;
    }
  }
};

export { reducer as pluginReducer };
