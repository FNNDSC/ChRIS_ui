import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IResourceState,
  PluginInstanceObj,
  DestroyActiveResources,
} from "./types";
import { getStatusLabels } from "./utils";
import type { PluginInstance } from "@fnndsc/chrisapi";

const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
};

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    getPluginInstanceResources(
      _state,
      _action: PayloadAction<PluginInstance[]>,
    ) {
      // No state mutation needed for this action
    },
    getPluginInstanceResourceSuccess(state, action: PayloadAction<any>) {
      const { id, pluginStatus, pluginLog, pluginDetails, previousStatus } =
        action.payload;
      const pluginStatusLabels = getStatusLabels(
        pluginStatus,
        pluginDetails,
        previousStatus,
      );
      state.pluginInstanceResource[id] = {
        pluginStatus: pluginStatusLabels,
        pluginLog,
      };
    },
    stopFetchingPluginResources(_state, _action: PayloadAction<number>) {
      // No state mutation needed for this action
    },
    getPluginInstanceStatusRequest(
      _state,
      _action: PayloadAction<PluginInstanceObj>,
    ) {
      // No state mutation needed for this action
    },
    getPluginInstanceStatusSuccess(
      state,
      action: PayloadAction<{ selected: PluginInstance; status: string }>,
    ) {
      const { selected, status } = action.payload;
      state.pluginInstanceStatus[selected.data.id] = { status };
    },
    stopFetchingStatusResources(_state, _action: PayloadAction<number>) {
      // No state mutation needed for this action
    },

    resetActiveResources(
      _state,
      _action: PayloadAction<DestroyActiveResources>,
    ) {
      return initialState;
    },
  },
});

export const {
  getPluginInstanceResources,
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  getPluginInstanceStatusRequest,
  getPluginInstanceStatusSuccess,
  stopFetchingStatusResources,

  resetActiveResources,
} = resourceSlice.actions;

export default resourceSlice.reducer;
