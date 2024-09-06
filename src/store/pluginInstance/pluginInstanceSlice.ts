import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { catchError, fetchResource } from "../../api/common";
import type {
  IPluginInstanceState,
  AddNodePayload,
  PluginInstanceObj,
} from "./types";
import { getPluginInstanceStatusRequest } from "../resources/resourceSlice";

// Define the initial state
const initialState: IPluginInstanceState = {
  selectedPlugin: undefined,
  pluginInstances: {
    data: [],
    error: "",
    loading: false,
  },
};

// Async thunk for fetching plugin instances
export const fetchPluginInstances = createAsyncThunk<
  PluginInstanceObj,
  Feed,
  { rejectValue: string }
>(
  "pluginInstance/fetchPluginInstances",
  async (feed, { dispatch, rejectWithValue }) => {
    try {
      const params = { limit: 15, offset: 0 };
      const fn = feed.getPluginInstances;
      const boundFn = fn.bind(feed);

      //fetch resource is a utility to fetch paginate resources
      const { resource: pluginInstances } = await fetchResource<PluginInstance>(
        params,
        boundFn,
      );

      const selected = pluginInstances[pluginInstances.length - 1];
      const pluginInstanceObj = {
        selected,
        pluginInstances,
      };
      //This action triggers a resource fetch in the resource saga
      dispatch(getSelectedPlugin(selected));
      dispatch(getPluginInstanceStatusRequest(pluginInstanceObj));
      return { selected, pluginInstances };
    } catch (error) {
      const errMessage = catchError(error).error_message;
      return rejectWithValue(errMessage);
    }
  },
);

// Async thunk for adding a node
export const addNode = createAsyncThunk<
  PluginInstanceObj,
  AddNodePayload,
  { rejectValue: string }
>(
  "pluginInstance/addNode",
  async ({ pluginItem, nodes }, { dispatch, rejectWithValue }) => {
    try {
      const pluginInstances = [...nodes, pluginItem];
      dispatch(getSelectedPlugin(pluginItem));
      dispatch(
        getPluginInstanceStatusRequest({
          selected: pluginItem,
          pluginInstances,
        }),
      );
      return { selected: pluginItem, pluginInstances };
    } catch (error) {
      return rejectWithValue("Failed to add node.");
    }
  },
);

// Create a slice
const pluginInstanceSlice = createSlice({
  name: "pluginInstance",
  initialState,
  reducers: {
    getSelectedPlugin(state, action: PayloadAction<PluginInstance>) {
      state.selectedPlugin = action.payload;
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
    setPluginInstancesAndSelectedPlugin(
      state,
      action: PayloadAction<{
        selected: PluginInstance;
        pluginInstances: PluginInstance[];
      }>,
    ) {
      state.selectedPlugin = action.payload.selected;
      state.pluginInstances.data = action.payload.pluginInstances;
    },
    resetPluginInstances(_state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPluginInstances.pending, (state) => {
        state.pluginInstances.loading = true;
        state.pluginInstances.error = "";
      })
      .addCase(
        fetchPluginInstances.fulfilled,
        (state, action: PayloadAction<PluginInstanceObj>) => {
          state.pluginInstances = {
            data: action.payload.pluginInstances,
            error: "",
            loading: false,
          };
        },
      )
      .addCase(fetchPluginInstances.rejected, (state, action) => {
        state.pluginInstances = {
          data: [],
          error: action.payload || "Failed to fetch plugin instances.",
          loading: false,
        };
      })

      .addCase(
        addNode.fulfilled,
        (state, action: PayloadAction<PluginInstanceObj>) => {
          if (state.pluginInstances.data) {
            state.pluginInstances.data.push(action.payload.selected);
          } else {
            state.pluginInstances.data = [action.payload.selected];
          }
        },
      );
  },
});

// Export the actions
export const {
  getSelectedPlugin,
  setPluginTitle,
  resetPluginInstances,
  setPluginInstancesAndSelectedPlugin,
} = pluginInstanceSlice.actions;

// Export the reducer
export default pluginInstanceSlice.reducer;
