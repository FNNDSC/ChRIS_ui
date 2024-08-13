import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  IResourceState,
  PluginInstanceObj,
  DestroyActiveResources,
} from "./types";
import { getStatusLabels } from "./utils";
import type {
  PluginInstance,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";

const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
  pluginFiles: {},
  url: "",
  loading: false,
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
    getPluginFilesRequest(
      state,
      _action: PayloadAction<{ id: number; path: string }>,
    ) {
      state.loading = true;
    },
    getPluginFilesSuccess(
      state,
      action: PayloadAction<{
        id: string;
        folderFiles: FileBrowserFolderFile[];
        linkFiles: FileBrowserFolderLinkFile[];
        children: any[];
        path: string;
      }>,
    ) {
      const { id, folderFiles, linkFiles, children, path } = action.payload;
      state.loading = false;
      state.pluginFiles[id] = {
        folderFiles,
        children,
        linkFiles,
        error: "",
        path,
      };
    },
    getPluginFilesError(
      state,
      action: PayloadAction<{ id: number; error: any }>,
    ) {
      const { id, error } = action.payload;
      state.loading = false;
      state.pluginFiles[id] = {
        ...state.pluginFiles[id],
        error,
      };
    },
    resetActiveResources(
      _state,
      _action: PayloadAction<DestroyActiveResources>,
    ) {
      return initialState;
    },
    setCurrentUrl(state, action: PayloadAction<string>) {
      state.url = action.payload;
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
  getPluginFilesRequest,
  getPluginFilesSuccess,
  getPluginFilesError,
  resetActiveResources,
  setCurrentUrl,
} = resourceSlice.actions;

export default resourceSlice.reducer;
