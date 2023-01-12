import { Reducer } from "redux";

import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  parameters: [],
  computeEnv: undefined,
  nodeOperations: {
    terminal: false,
    childNode: false,
    childPipeline: false,
    childGraph: false,
    deleteNode: false,
  },
};

const reducer: Reducer<IPluginState> = (state = initialState, action) => {
  switch (action.type) {
    case PluginActionTypes.GET_NODE_OPERATIONS: {
      return {
        ...state,
        nodeOperations: {
          ...state.nodeOperations,
          [action.payload]: !state.nodeOperations[action.payload],
        },
      };
    }

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
