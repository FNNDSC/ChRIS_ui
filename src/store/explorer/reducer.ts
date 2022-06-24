import { Reducer } from 'redux'
import { ExplorerActionTypes, ExplorerMode, IExplorerState } from './types'

// Type-safe initialState
const initialState: IExplorerState = {
  explorer: undefined,
  selectedFile: undefined,
  mode: ExplorerMode.SwiftFileBrowser,
  selectedFolder: undefined,
  enableDcmTool: false,
  files: [],
  externalFiles: [],
}

const reducer: Reducer<IExplorerState> = (state = initialState, action) => {
  switch (action.type) {
    case ExplorerActionTypes.SET_EXPLORER_REQUEST: {
      return {
        ...state,
        explorer: action.payload,
      }
    }
    case ExplorerActionTypes.SET_SELECTED_FILE: {
      const selectedFile = action.payload

      return {
        ...state,
        selectedFile,
      }
    }

    case ExplorerActionTypes.SET_SELECTED_FOLDER: {
      const selectedFolder = action.payload
      return {
        ...state,
        selectedFolder,
      }
    }

    case ExplorerActionTypes.SET_EXPLORER_MODE: {
      return { ...state, mode: action.payload }
    }
    case ExplorerActionTypes.DESTROY_EXPLORER: {
      return {
        ...state,
        explorer: undefined,
        selectedFile: undefined,
        mode: ExplorerMode.SwiftFileBrowser,
        selectedFolder: undefined,
        enableDcmTool: false,
        files: [],
        externalFiles: [],
      }
    }

    case ExplorerActionTypes.ENABLE_DCM_TOOL: {
      return { ...state, enableDcmTool: action.payload }
    }

    case ExplorerActionTypes.SET_GALLERY_FILES: {
      return {
        ...state,
        files: [...action.payload],
      }
    }

    case ExplorerActionTypes.CLEAR_GALLERY_FILES: {
      return {
        ...state,
        files: [],
      }
    }

    case ExplorerActionTypes.EXTERNAL_FILES: {
      return {
        ...state,
        externalFiles: action.payload,
      }
    }

    default: {
      return state
    }
  }
}

export { reducer as explorerReducer }
