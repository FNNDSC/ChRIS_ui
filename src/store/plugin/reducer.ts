import { Reducer } from "redux";
import { PluginActionTypes, IPluginState } from "./types";

// Type-safe initialState
const initialState: IPluginState = {
  pluginFiles: {},
  parameters: [],
  pluginStatus: "",
  pluginLog: {},
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
      return {
        ...state,
        pluginStatus: action.payload,
      };
    }

    case PluginActionTypes.GET_PLUGIN_LOG: {
      return {
        ...state,
        pluginLog: action.payload,
      };
    }

    case PluginActionTypes.RESET_PLUGIN_STATE: {
      return {
        ...state,
        pluginFiles: {},
        pluginStatus: "",
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as pluginReducer };
