import { Reducer } from "redux";
import { getStatusLabels } from "../../components/feed/FeedOutputBrowser/utils";
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
    case PluginActionTypes.GET_PLUGIN_FILES_SUCCESS: {
      const id = Number(action.payload[0].data.plugin_inst_id);
      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: action.payload,
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

    case PluginActionTypes.GET_PLUGIN_STATUS: {
      let pluginStatus;
      let status;

      if (action.payload) {
        pluginStatus = JSON.parse(action.payload);
        status = getStatusLabels(pluginStatus);
      }

      return {
        ...state,
        pluginStatus: status,
      };
    }

    case PluginActionTypes.STOP_POLLING: {
      return {
        ...state,
        computeError: false,
      };
    }

    case PluginActionTypes.GET_COMPUTE_ERROR_SUCCESS: {
      return {
        ...state,
        computeError: action.payload,
      };
    }

    case PluginActionTypes.GET_PLUGIN_LOG: {
      return {
        ...state,
        pluginLog: action.payload,
      };
    }

    case PluginActionTypes.GET_COMPUTE_ENV_SUCCESS: {
      return {
        ...state,
        computeEnv: action.payload,
      };
    }

    case PluginActionTypes.RESET_PLUGIN_STATE: {
      return {
        ...state,
        pluginFiles: {},
        pluginStatus: undefined,
        pluginLog: {},
        computeError: false,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as pluginReducer };
