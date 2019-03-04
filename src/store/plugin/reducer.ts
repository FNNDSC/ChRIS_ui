import { Reducer } from "redux";
import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  selected: undefined,
  descendants: undefined
};

// ***** NOTE: Working *****
const reducer: Reducer<IPluginState> = (state = initialState, action) => {
  switch (action.type) {
    // case PluginActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
    //   // Note: when using the ChrisAPI the items will be action.payload.collection.items
    //   // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
    //   return { ...state, items: action.payload.data.results };
    // }
    case PluginActionTypes.GET_PLUGIN_DESCENDANTS_SUCCESS: {
      const descendants = action.payload.data.results;
      const selected =
        !!action.payload.data.results &&
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
