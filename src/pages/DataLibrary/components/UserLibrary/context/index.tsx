import React, { createContext, useReducer } from 'react'

export interface Paginated {
  hasNext: boolean
  limit: number
  offset: number
  totalCount: number
}

export interface FileSelect {
  folder: { name: string; path: string }
  type: string
  previousPath: string
  operation: string
}

interface LibraryState {
  filesState: {
    [key: string]: any[]
  }
  foldersState: {
    [key: string]: { path: string; name: string }[]
  }
  currentSearchFiles: {
    [key: string]: any[]
  }
  currentSearchFolders: {
    [key: string]: { path: string; name: string }[]
  }
  folderDetails: {
    currentFolder: string
    totalCount: number
  }
  previewAll: boolean
  loading: boolean
  selectedFolder: FileSelect[]
  tooltip: boolean
  currentPath: {
    [key: string]: string[]
  }
  searchedFoldersState: {
    [key: string]: { path: string, name: string }[]
  }
  searchPath: {
    [key: string]: string[]
  }
  search: {
    [key: string]: boolean
  }
}

function getInitialState(): LibraryState {
  return {
    filesState: {},
    foldersState: {},
    folderDetails: {
      currentFolder: '',
      totalCount: 0,
    },
    previewAll: false,
    loading: false,
    selectedFolder: [],
    tooltip: false,
    currentPath: {},
    searchPath: {},
    search: {},
    searchedFoldersState: {},
    currentSearchFolders: {},
    currentSearchFiles: {}
  }
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key
  }
  : {
    type: Key
    payload: M[Key]
  }
}

export enum Types {
  SET_FILES = 'SET_FILES',
  SET_FOLDERS = 'SET_FOLDERS',
  SET_CURRENT_PATH = 'SET_CURRENT_PATH',
  SET_CURRENT_PATH_SEARCH = 'SET_CURRENT_PATH_SEARCH',
  SET_SEARCHED_FOLDERS = 'SET_SEARCHED_FOLDERS',
  SET_SEARCH = 'SET_SEARCH',
  SET_LOADING = 'SET_LOADING',
  SET_FOLDER_DETAILS = 'SET_FOLDER_DETAILS',
  SET_PREVIEW_ALL = 'SET_PREVIEW_ALL',
  SET_ADD_FOLDER = 'SET_ADD_FOLDER',
  SET_SELECTED_FOLDER = 'SET_SELECTED_FOLDER',
  SET_CLEAR_FILE_SELECT = 'SET_CLEAR_FILE_SELECT',
  CLEAR_FOLDER_STATE = 'CLEAR_FOLDER_STATE',
  CLEAR_SELECTED_FOLDER = 'CLEAR_SELECTED_FOLDER',
  CLEAR_FILES_STATE = 'CLEAR_FILES_STATE',
  SET_TOOLTIP = 'SET_TOOLTIP',
  SET_CURRENT_SEARCH_FOLDERS = 'SET_CURRENT_SEARCH_FOLDERS',
  SET_CURRENT_SEARCH_FILES = 'SET_CURRENT_SEARCH_FILES'
}

type LibraryPayload = {
  [Types.SET_FILES]: {
    files: any[]
    path: string
  }
  [Types.SET_FOLDERS]: {
    folders: { path: string; name: string }[]
    path: string
  }

  [Types.SET_CURRENT_SEARCH_FOLDERS]: {
    currentSearchedFolders: { path: string, name: string }[]
    path: string
  }

  [Types.SET_CURRENT_SEARCH_FILES]: {
    files: any[]
    path: string
  }


  [Types.SET_SEARCHED_FOLDERS]: {
    folders: { path: string, name: string }[]
    type: string
  }

  [Types.SET_CURRENT_PATH]: {
    type: string
    path: string
  }

  [Types.SET_CURRENT_PATH_SEARCH]: {
    type: string
    path: string
  }

  [Types.SET_LOADING]: {
    loading: false
  }
  [Types.SET_FOLDER_DETAILS]: {
    currentFolder: string
    totalCount: number
  }
  [Types.SET_PREVIEW_ALL]: {
    previewAll: boolean
  }

  [Types.SET_ADD_FOLDER]: {
    folder: string
    username: string | null | undefined
  }

  [Types.SET_CLEAR_FILE_SELECT]: {
    clear: boolean
  }

  [Types.SET_SELECTED_FOLDER]: {
    selectFolder: FileSelect
  }

  [Types.CLEAR_SELECTED_FOLDER]: {
    selectFolder: FileSelect
  }

  [Types.CLEAR_FOLDER_STATE]: {
    path: string
    type: string
  }

  [Types.CLEAR_FILES_STATE]: {
    path: string
  }
  [Types.SET_TOOLTIP]: {
    tooltip: boolean
  }

  [Types.SET_SEARCH]: {
    type: string
  }
}

export type LibraryActions = ActionMap<LibraryPayload>[keyof ActionMap<
  LibraryPayload
>]

const LibraryContext = createContext<{
  state: LibraryState
  dispatch: React.Dispatch<any>
}>({
  state: getInitialState(),
  dispatch: () => null,
})

export const libraryReducer = (
  state: LibraryState,
  action: LibraryActions,
): LibraryState => {
  switch (action.type) {
    case Types.SET_FOLDERS: {
      return {
        ...state,
        foldersState: {
          [action.payload.path]: action.payload.folders,
        },
      }
    }

    case Types.SET_FOLDERS: {
      return {
        ...state,
        foldersState: {
          [action.payload.path]: action.payload.folders,
        },
      }
    }

    case Types.SET_SEARCHED_FOLDERS: {
      return {
        ...state,
        searchedFoldersState: {
          ...state.searchedFoldersState,
          [action.payload.type]: action.payload.folders
        }
      }
    }

    case Types.SET_SEARCH: {
      return {
        ...state,
        search: {
          ...state.search,
          [action.payload.type]: true
        }
      }
    }

    case Types.SET_CURRENT_PATH: {

      const { type, path } = action.payload
      return {
        ...state,
        currentPath: {
          [type]: [path],
        },
      }

    }
    case Types.SET_CURRENT_PATH_SEARCH: {
      const { type, path } = action.payload
      return {
        ...state,
        searchPath: {
          [type]: [path],
        },
      }

    }


    case Types.SET_FILES: {
      if (action.payload.files.length == 0) {
        return {
          ...state,
          filesState: {},
        }
      } else {
        return {
          ...state,
          filesState: {
            ...state.filesState,
            [action.payload.path]: action.payload.files,
          },
        }
      }
    }

    case Types.SET_SELECTED_FOLDER: {
      const {
        folder,
        type,
        previousPath,
        operation,
      } = action.payload.selectFolder
      const folderPayload = {
        type,
        folder,
        previousPath,
        operation
      }
      return {
        ...state,
        selectedFolder: [...state.selectedFolder, folderPayload],
      }
    }

    case Types.SET_CLEAR_FILE_SELECT: {
      return {
        ...state,
        selectedFolder: [],
      }
    }

    case Types.CLEAR_SELECTED_FOLDER: {
      const { selectFolder } = action.payload

      const newFileSelect = state.selectedFolder.filter(
        (item) => item.folder.path !== selectFolder.folder.path,
      )

      return {
        ...state,
        selectedFolder: newFileSelect,
      }
    }

    case Types.SET_FOLDER_DETAILS: {
      return {
        ...state,
        folderDetails: {
          currentFolder: action.payload.currentFolder,
          totalCount: action.payload.totalCount,
        },
      }
    }

    case Types.SET_PREVIEW_ALL: {
      return {
        ...state,
        previewAll: action.payload.previewAll,
      }
    }

    case Types.SET_TOOLTIP: {
      return {
        ...state,
        tooltip: action.payload.tooltip,
      }
    }

    case Types.SET_ADD_FOLDER: {
      const { username, folder } = action.payload
      const path = `${username}/uploads`
      const folderDetails = {
        name: folder,
        path,
      }

      if (state.foldersState[path]) {
        return {
          ...state,
          foldersState: {
            [path]: [...state.foldersState[path], folderDetails],
          },
        }
      } else {
        return {
          ...state,
          foldersState: {
            [path]: [folderDetails],
          },
        }
      }
    }
    default:
      return state
  }
}

interface LibraryProviderProps {
  children: React.ReactNode
}

const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const initialState = getInitialState()
  const [state, dispatch] = useReducer(libraryReducer, initialState)
  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  )
}

export { LibraryContext, LibraryProvider }
