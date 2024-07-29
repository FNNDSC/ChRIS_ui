import { produce } from "immer";
import type { Reducer } from "redux";
import { PluginActionTypes, type IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  parameters: {
    dropdown: [],
    required: [],
  },
  computeEnv: undefined,
  nodeOperations: {
    terminal: false,
    childNode: false,
    childPipeline: false,
    childGraph: false,
    deleteNode: false,
  },
};

const reducer: Reducer<IPluginState> = produce(
  (draft: IPluginState, action: typeof PluginActionTypes) => {
    switch (action.type) {
      case PluginActionTypes.GET_NODE_OPERATIONS: {
        draft.nodeOperations[action.payload] =
          !draft.nodeOperations[action.payload];
        break;
      }

      case PluginActionTypes.GET_PARAMS_SUCCESS: {
        draft.parameters.required = action.payload.required;
        draft.parameters.dropdown = action.payload.dropdown;
        break;
      }

      case PluginActionTypes.GET_COMPUTE_ENV_SUCCESS: {
        draft.computeEnv = action.payload;
        break;
      }

      default: {
        return draft;
      }
    }
  },
  initialState,
);

export { reducer as pluginReducer };
