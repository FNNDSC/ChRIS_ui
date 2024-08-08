import type { Reducer } from "redux";
import { produce } from "immer";
import { type IResourceState, ResourceTypes } from "./types";
import { getStatusLabels } from "./utils";

export const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
  pluginFiles: {},
  url: "",
  loading: false,
};

const reducer: Reducer<IResourceState, typeof ResourceTypes> = produce(
  (draft: IResourceState, action: typeof ResourceTypes) => {
    switch (action.type) {
      case ResourceTypes.GET_PLUGIN_STATUS_SUCCESS: {
        const { selected, status } = action.payload;
        draft.pluginInstanceStatus[selected.data.id] = { status };
        break;
      }

      case ResourceTypes.GET_PLUGIN_FILES_REQUEST: {
        draft.loading = true;
        break;
      }

      case ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: {
        const { id, pluginStatus, pluginLog, pluginDetails, previousStatus } =
          action.payload;
        const pluginStatusLabels = getStatusLabels(
          pluginStatus,
          pluginDetails,
          previousStatus,
        );
        draft.pluginInstanceResource[id] = {
          pluginStatus: pluginStatusLabels,
          pluginLog,
        };
        break;
      }

      case ResourceTypes.GET_PLUGIN_FILES_SUCCESS: {
        const { id, folderFiles, linkFiles, children, path } = action.payload;
        draft.loading = false;
        draft.pluginFiles[id] = {
          folderFiles,
          children,
          linkFiles,
          error: "",
          path,
        };
        break;
      }

      case ResourceTypes.GET_PLUGIN_FILES_ERROR: {
        const { id, error } = action.payload;
        draft.loading = false;
        draft.pluginFiles[id] = {
          ...draft.pluginFiles[id],
          error,
        };
        break;
      }

      case ResourceTypes.RESET_ACTIVE_RESOURCES: {
        return initialState;
      }

      case ResourceTypes.SET_CURRENT_URL: {
        draft.url = action.payload;
        break;
      }

      default:
        return draft;
    }
  },
  initialState,
);

export { reducer as resourceReducer };
