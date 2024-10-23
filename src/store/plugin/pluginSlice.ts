import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Plugin, PluginParameter } from "@fnndsc/chrisapi";
import { fetchResource } from "../../api/common";

// Define the initial state
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

// Create async thunk to replace the saga
export const fetchParamsAndComputeEnv = createAsyncThunk(
  "plugin/fetchParamsAndComputeEnv",
  async (plugin: Plugin, { rejectWithValue }) => {
    try {
      const fn = plugin.getPluginParameters;
      const boundFn = fn.bind(plugin);
      const { resource: params } = await fetchResource<PluginParameter>(
        { limit: 20, offset: 0 },
        boundFn,
      );

      const computeFn = plugin.getPluginComputeResources;
      const boundComputeFn = computeFn.bind(plugin);
      const { resource: computeEnvs } = await fetchResource<any>(
        { limit: 20, offset: 0 },
        boundComputeFn,
      );

      const required = params.filter(
        (param: PluginParameter) => param.data.optional === false,
      );
      const dropdown = params.filter(
        (param: PluginParameter) => param.data.optional === true,
      );

      return { required, dropdown, computeEnvs };
    } catch (error: any) {
      let errorMessage =
        "Unhandled error. Please reach out to @devbabymri.org to report this error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  },
);

const pluginSlice = createSlice({
  name: "plugin",
  initialState,
  reducers: {
    getNodeOperations(state, action: PayloadAction<string>) {
      const key = action.payload;
      if (key in state.nodeOperations) {
        state.nodeOperations[key] = !state.nodeOperations[key];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParamsAndComputeEnv.fulfilled, (state, action) => {
        state.parameters.required = action.payload.required;
        state.parameters.dropdown = action.payload.dropdown;
        state.computeEnv = action.payload.computeEnvs;
      })
      .addCase(fetchParamsAndComputeEnv.rejected, (state, action) => {
        state.resourceError = action.payload as string;
      });
  },
});

// Export the actions
export const { getNodeOperations } = pluginSlice.actions;

// Export the reducer
export default pluginSlice.reducer;
