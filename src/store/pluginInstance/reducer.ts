import { produce } from "immer";
import type { Reducer } from "redux";
import { type IPluginInstanceState, PluginInstanceTypes } from "./types";

export const initialState: IPluginInstanceState = {
  selectedPlugin: undefined,
  pluginInstances: {
    data: undefined,
    error: "",
    loading: false,
  },
  selectedD3Node: undefined,
};

const reducer: Reducer<IPluginInstanceState> = produce(
  (
    draft: IPluginInstanceState,
    action: { type: keyof typeof PluginInstanceTypes; payload?: any },
  ) => {
    switch (action.type) {
      case PluginInstanceTypes.GET_SELECTED_D3_NODE: {
        draft.selectedD3Node = action.payload;
        break;
      }

      case PluginInstanceTypes.GET_PLUGIN_INSTANCES_REQUEST: {
        draft.pluginInstances.loading = true;
        break;
      }

      case PluginInstanceTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
        draft.selectedPlugin = action.payload.selected;
        draft.pluginInstances = {
          data: action.payload.pluginInstances,
          error: "",
          loading: false,
        };
        break;
      }

      case PluginInstanceTypes.GET_PLUGIN_INSTANCES_ERROR: {
        draft.pluginInstances = {
          data: undefined,
          error: action.payload,
          loading: false,
        };
        break;
      }

      case PluginInstanceTypes.GET_SELECTED_PLUGIN: {
        draft.selectedPlugin = action.payload;
        break;
      }

      case PluginInstanceTypes.SET_PLUGIN_TITLE: {
        if (draft.pluginInstances.data) {
          const foundIndex = draft.pluginInstances.data.findIndex(
            (instance) => instance.data.id === action.payload.data.id,
          );
          if (foundIndex !== -1) {
            draft.pluginInstances.data[foundIndex] = action.payload;
            draft.selectedPlugin = action.payload;
          }
        }
        break;
      }

      case PluginInstanceTypes.ADD_NODE_SUCCESS: {
        if (draft.pluginInstances.data) {
          draft.pluginInstances.data.push(action.payload);
        } else {
          draft.pluginInstances.data = [action.payload];
        }
        break;
      }

      case PluginInstanceTypes.ADD_SPLIT_NODES_SUCCESS: {
        if (draft.pluginInstances.data) {
          draft.pluginInstances.data.push(...action.payload);
        }
        break;
      }

      case PluginInstanceTypes.RESET_PLUGIN_INSTANCES: {
        return initialState;
      }

      default:
        return draft; // Ensure draft is returned in default case
    }
  },
  initialState,
);

export { reducer as pluginInstanceReducer };
