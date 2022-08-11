import { Reducer } from 'redux'
import { IResourceState, ResourceTypes } from './types'
import { getStatusLabels } from './utils'

export const initialState: IResourceState = {
  pluginInstanceStatus: {},
  pluginInstanceResource: {},
  pluginFiles: {},
  url: '',
}

const reducer: Reducer<IResourceState> = (state = initialState, action) => {
  switch (action.type) {
    case ResourceTypes.GET_PLUGIN_STATUS_SUCCESS: {
      const { selected, status } = action.payload

      return {
        ...state,
        pluginInstanceStatus: {
          ...state.pluginInstanceStatus,
          [selected.data.id]: {
            status,
          },
        },
      }
    }

    case ResourceTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: {
      const {
        id,
        pluginStatus,
        pluginLog,
        pluginDetails,
        previousStatus,
      } = action.payload
      const pluginStatusLabels = getStatusLabels(
        pluginStatus,
        pluginDetails,
        previousStatus,
      )

      return {
        ...state,
        pluginInstanceResource: {
          ...state.pluginInstanceResource,
          [id]: {
            pluginStatus: pluginStatusLabels,
            pluginLog,
          },
        },
      }
    }

    case ResourceTypes.GET_PLUGIN_FILES_SUCCESS: {
      const { id, files, folders, path } = action.payload

      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files,
            folders,
            error: '',
            path,
          },
        },
      }
    }

    case ResourceTypes.GET_PLUGIN_FILES_ERROR: {
      const { id, error } = action.payload
      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files: [],
            error,
          },
        },
      }
    }

    case ResourceTypes.RESET_ACTIVE_RESOURCES: {
      return {
        ...initialState,
      }
    }

    case ResourceTypes.SET_CURRENT_URL: {
      return {
        ...state,
        url: action.payload,
      }
    }

    default:
      return state
  }
}

export { reducer as resourceReducer }
