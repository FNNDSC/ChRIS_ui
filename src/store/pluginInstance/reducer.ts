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
  selectedD3Node: undefined,
};

const reducer: Reducer<IPluginInstanceState> = (
  state = initialState,
  action: typeof PluginInstanceTypes,
) => {
  switch (action.type) {
    case PluginInstanceTypes.GET_SELECTED_D3_NODE: {
      return {
        ...state,
        selectedD3Node: action.payload,
      };
    }

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

    case PluginInstanceTypes.GET_SELECTED_PLUGIN: {
      return {
        ...state,
        selectedPlugin: action.payload,
      };
    }

    case PluginInstanceTypes.SET_PLUGIN_TITLE: {
      let cloneInstances: PluginInstance[] = [];
      if (state.pluginInstances.data) {
        const instances = state.pluginInstances.data;
        const foundIndex = instances.findIndex(
          (instance) => instance.data.id === action.payload.data.id,
        );
        cloneInstances = [...instances];

        cloneInstances[foundIndex] = action.payload;
        return {
          ...state,
          pluginInstances: {
            ...state.pluginInstances,
            data: cloneInstances,
          },
          selectedPlugin: action.payload,
        };
      }
      return { ...state };
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
      }
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
      }
      return state;
    }

    case PluginInstanceTypes.RESET_PLUGIN_INSTANCES: {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
};

export { reducer as pluginInstanceReducer };
