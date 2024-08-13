import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { Plugin, PluginParameter } from "@fnndsc/chrisapi";

export interface IPluginState {
  parameters: {
    required: PluginParameter[];
    dropdown: PluginParameter[];
  };
  computeEnv?: any[];
  resourceError: string;
  nodeOperations: {
    [key: string]: boolean;
  };
}

// Define the initial state
const initialState: IPluginState = {
  parameters: {
    dropdown: [],
    required: [],
  },
  computeEnv: undefined,
  resourceError: "",
  nodeOperations: {
    terminal: false,
    childNode: false,
    childPipeline: false,
    childGraph: false,
    deleteNode: false,
  },
};

// Create a slice
const pluginSlice = createSlice({
  name: "plugin",
  initialState,
  reducers: {
    getParams(_state, _action: PayloadAction<Plugin>) {
      // This action might be redundant if parameters are fetched in another way
    },
    getParamsSuccess(
      state,
      action: PayloadAction<{
        required: PluginParameter[];
        dropdown: PluginParameter[];
      }>,
    ) {
      state.parameters.required = action.payload.required;
      state.parameters.dropdown = action.payload.dropdown;
    },
    getComputeEnv(_state, _action: PayloadAction<PluginParameter[]>) {
      // This action might be redundant if computeEnv is fetched in another way
    },
    getComputeEnvSuccess(state, action: PayloadAction<any[]>) {
      state.computeEnv = action.payload;
    },
    getComputeEnvError(state, action: PayloadAction<string>) {
      state.resourceError = action.payload;
    },
    getNodeOperations(state, action: PayloadAction<string>) {
      const key = action.payload;
      if (key in state.nodeOperations) {
        state.nodeOperations[key] = !state.nodeOperations[key];
      }
    },
  },
});

// Export the actions
export const {
  getParams,
  getParamsSuccess,
  getComputeEnv,
  getComputeEnvSuccess,
  getComputeEnvError,
  getNodeOperations,
} = pluginSlice.actions;

// Export the reducer
export default pluginSlice.reducer;
