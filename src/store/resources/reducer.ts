import { Reducer } from "redux";
import { IResourceState, ResourceTypes } from "./types";
import { getStatusLabels } from "./utils";

export const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
  pluginFiles: {},
};

const reducer: Reducer<IResourceState> = (state = initialState, action) => {
  switch (action.type) {
    case ResourceTypes.GET_PLUGIN_STATUS_SUCCESS: {
      const { selected, status } = action.payload;

      return {
        ...state,
        pluginInstanceStatus: {
          ...state.pluginInstanceStatus,
          [selected.data.id]: {
            status,
          },
        },
      };
    }

    case ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: {
      const { id, pluginStatus, pluginLog, pluginDetails } = action.payload;
      const pluginStatusLabels = getStatusLabels(pluginStatus, pluginDetails);

      return {
        ...state,
        pluginInstanceResource: {
          ...state.pluginInstanceResource,
          [id]: {
            pluginStatus: pluginStatusLabels,
            pluginLog,
          },
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_FILES_SUCCESS: {
      const { id, files } = action.payload;

      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files,
            error: "",
          },
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_FILES_ERROR: {
      const { id, error } = action.payload;
      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files: [],
            error,
          },
        },
      };
    }

    default:
      return state;
  }
};

export { reducer as ResourceReducer };
