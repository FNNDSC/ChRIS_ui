import { Reducer } from "redux";
import { IPluginInstanceState, PluginInstanceTypes } from "./types";
import { PluginInstance } from "@fnndsc/chrisapi";

export const initialState: IPluginInstanceState = {
  selectedPlugin: undefined,
  pluginInstances: {
    data: undefined,
    error: "",
    loading: false,
  },
};

const reducer: Reducer<IPluginInstanceState> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case PluginInstanceTypes.GET_PLUGIN_INSTANCES_REQUEST: {
      return {
        ...state,
        pluginInstances: {
          ...state.pluginInstances,
          loading: true,
        },
      };
    }

    case PluginInstanceTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      return {
        ...state,
        selectedPlugin: action.payload.selected,
        pluginInstances: {
          data: action.payload.pluginInstances,
          error: "",
          loading: false,
        },
      };
    }

    case PluginInstanceTypes.GET_PLUGIN_INSTANCES_ERROR: {
      return {
        ...state,
        pluginInstances: {
          data: undefined,
          error: action.payload,
          loading: false,
        },
      };
    }

    case PluginInstanceTypes.ADD_NODE_REQUEST: {
      return {
        ...state,
        loadingAddNode: true,
      };
    }

    case PluginInstanceTypes.ADD_NODE_SUCCESS: {
      if (state.pluginInstances.data) {
        const pluginList = [...state.pluginInstances.data, action.payload];
        return {
          ...state,
          pluginInstances: {
            data: pluginList,
            error: "",
            loading: false,
          },
          loadingAddNode: false,
        };
      } else
        return {
          ...state,
          pluginInstances: {
            data: action.payload,
            error: "",
            loading: false,
          },
          loadingAddNode: false,
        };
    }

    case PluginInstanceTypes.ADD_SPLIT_NODES_SUCCESS: {
      const pluginInstances = state.pluginInstances.data;
      if (pluginInstances) {
        const newList: PluginInstance[] = [
          ...pluginInstances,
          ...action.payload,
        ];
        return {
          ...state,
          pluginInstances: {
            data: newList,
            error: "",
            loading: false,
          },
        };
      } else return state;
    }

    default:
      return state;
  }
};

export { reducer as pluginInstanceReducer };
