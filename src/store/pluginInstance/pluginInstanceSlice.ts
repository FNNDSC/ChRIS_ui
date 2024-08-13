import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IPluginInstanceState,
  AddNodePayload,
  PluginInstanceObj,
} from "./types";
import type { Feed, PluginInstance } from "@fnndsc/chrisapi";

// Define the initial state
const initialState: IPluginInstanceState = {
  selectedPlugin: undefined,
  pluginInstances: {
    data: undefined,
    error: "",
    loading: false,
  },
  selectedD3Node: undefined,
};

// Create a slice
const pluginInstanceSlice = createSlice({
  name: "pluginInstance",
  initialState,
  reducers: {
    getSelectedPlugin(state, action: PayloadAction<PluginInstance>) {
      state.selectedPlugin = action.payload;
    },
    getSelectedD3Node(state, action: PayloadAction<any>) {
      state.selectedD3Node = action.payload;
    },
    getPluginInstancesRequest(state, _action: PayloadAction<Feed>) {
      state.pluginInstances.loading = true;
    },
    getPluginInstancesSuccess(state, action: PayloadAction<PluginInstanceObj>) {
      state.selectedPlugin = action.payload.selected;
      state.pluginInstances = {
        data: action.payload.pluginInstances,
        error: "",
        loading: false,
      };
    },
    getPluginInstancesError(state, action: PayloadAction<string>) {
      state.pluginInstances = {
        data: undefined,
        error: action.payload,
        loading: false,
      };
    },
    addNodeRequest(_state, _action: PayloadAction<AddNodePayload>) {
      // This action might be redundant if node adding is handled in saga
    },
    addNodeSuccess(state, action: PayloadAction<PluginInstance>) {
      if (state.pluginInstances.data) {
        state.pluginInstances.data.push(action.payload);
      } else {
        state.pluginInstances.data = [action.payload];
      }
    },
    setPluginTitle(state, action: PayloadAction<PluginInstance>) {
      if (state.pluginInstances.data) {
        const foundIndex = state.pluginInstances.data.findIndex(
          (instance) => instance.data.id === action.payload.data.id,
        );
        if (foundIndex !== -1) {
          state.pluginInstances.data[foundIndex] = action.payload;
          state.selectedPlugin = action.payload;
        }
      }
    },
    resetPluginInstances(_state) {
      return initialState;
    },
  },
});

// Export the actions
export const {
  getSelectedPlugin,
  getSelectedD3Node,
  getPluginInstancesRequest,
  getPluginInstancesSuccess,
  getPluginInstancesError,
  addNodeRequest,
  addNodeSuccess,
  setPluginTitle,
  resetPluginInstances,
} = pluginInstanceSlice.actions;

// Export the reducer
export default pluginInstanceSlice.reducer;
