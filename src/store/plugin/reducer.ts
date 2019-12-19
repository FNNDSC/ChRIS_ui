import { Reducer } from "redux";
import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  selected: undefined,
  descendants: undefined,
  files: undefined
};

const reducer: Reducer<IPluginState> = (state = initialState, action) => {
  switch (action.type) {
    case PluginActionTypes.GET_PLUGIN_DETAILS: {
      return { ...state, files: undefined, parameters: undefined };
    }
    case PluginActionTypes.GET_PLUGIN_FILES_SUCCESS: {
      console.log(action.payload);
      return { ...state, files: action.payload };
    }

    case PluginActionTypes.GET_PLUGIN_DETAILS_SUCCESS: {
      const descendants = action.payload.data.results;
      const selected =
        !!action.payload.data.results &&
        action.payload.data.results.length &&
        action.payload.data.results[0]; // set first node as selected
      return { ...state, descendants, selected };
    }
    case PluginActionTypes.RESET_PLUGIN_STATE: {
      return {
        ...state,
        selected: undefined,
        descendants: undefined,
        files: undefined
      };
    }
    default: {
      return state;
    }
  }
};

export { reducer as pluginReducer };
