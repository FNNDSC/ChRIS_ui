import type { Reducer } from "redux";
import { type IResourceState, ResourceTypes } from "./types";
import { getStatusLabels } from "./utils";

export const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
  pluginFiles: {},
  url: "",
  loading: false,
};

const reducer: Reducer<IResourceState, typeof ResourceTypes> = (
  state = initialState,
  action: typeof ResourceTypes,
) => {
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

    case ResourceTypes.GET_PLUGIN_FILES_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }

    case ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: {
      const { id, pluginStatus, pluginLog, pluginDetails, previousStatus } =
        action.payload;
      const pluginStatusLabels = getStatusLabels(
        pluginStatus,
        pluginDetails,
        previousStatus,
      );

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

    case ResourceTypes.GET_PLUGIN_FILES_SUCCESS: {
      const { id, folderFiles, linkFiles, children, path } = action.payload;

      return {
        ...state,
        loading: false,
        pluginFiles: {
          [id]: {
            folderFiles,
            children,
            linkFiles,
            error: "",
            path,
          },
        },
      };
    }

    case ResourceTypes.GET_PLUGIN_FILES_ERROR: {
      const { id, error } = action.payload;
      return {
        ...state,
        loading: false,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            ...state.pluginFiles[id],
            error,
          },
        },
      };
    }

    case ResourceTypes.RESET_ACTIVE_RESOURCES: {
      return {
        ...initialState,
      };
    }

    case ResourceTypes.SET_CURRENT_URL: {
      return {
        ...state,
        url: action.payload,
      };
    }

    default:
      return state;
  }
};

export { reducer as resourceReducer };
