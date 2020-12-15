import { Reducer } from "redux";

import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  pluginFiles: {},
  parameters: [],
  pluginStatus: [],
  pluginLog: {},
  computeError: false,
 
};

const reducer: Reducer<IPluginState> = (state = initialState, action) => {
  switch (action.type) {
    case PluginActionTypes.GET_PARAMS_SUCCESS: {
      const params = action.payload;
      return {
        ...state,
        parameters: params,
      };
    }

    case PluginActionTypes.GET_COMPUTE_ENV_SUCCESS: {
      return {
        ...state,
        computeEnv: action.payload,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as pluginReducer };
