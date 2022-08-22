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
    [key: string]: {
      [key: string]: { path: string; name: string }[]
    }
  }
  foldersState: {
    [key: string]: {
      [key: string]: { path: string; name: string }[]
    }
  }
  currentSearchFiles: {
    [key: string]: { [key: string]: any[] }
  }
  currentSearchFolders: {
    [key: string]: {
      [key: string]: { name: string; path: string }[]
    }
  }
  folderDetails: {
    currentFolder: string
    totalCount: number
  }
  previewAll: boolean
  selectedFolder: FileSelect[]
  tooltip: string
  currentPath: { [key: string]: string }
  searchedFoldersState: {
    [key: string]: { [key: string]: { name: string; path: string }[] }[]
  }
  searchPath: {
    [key: string]: string
  }
  search: {
    [key: string]: boolean
  }
  emptySetIndicator: {
    [key: string]: string
  }
  fetchingResources: boolean
  columnLayout: string
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

    selectedFolder: [],
    tooltip: localStorage.getItem('tooltip') || 'true',
    currentPath: {},
    searchPath: {},
    search: {},
    searchedFoldersState: {},
    currentSearchFolders: {},
    currentSearchFiles: {},
    emptySetIndicator: {},
    fetchingResources: false,
    columnLayout: 'multi',
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
  SET_CURRENT_SEARCH_FILES = 'SET_CURRENT_SEARCH_FILES',
  CLEAR_SEARCH_FILTER = 'CLEAR_SEARCH_FILTER',
  BACK_TO_SEARCH_RESULTS = 'BACK_TO_SEARCH_RESULTS',
  SET_EMPTY_INDICATOR = 'SET_EMPTY_INDICATOR',
  SET_FETCHING_RESOURCES = 'SET_FETCHING_RESOURCES',
  SET_COLUMN_LAYOUT = 'SET_COLUMN_LAYOUT',
  DELETE_FILE = 'DELETE_FILE',
}

type LibraryPayload = {
  [Types.SET_FILES]: {
    files: any[]
    path: string
    type: string
  }
  [Types.SET_FOLDERS]: {
    folders: { path: string; name: string }[]
    path: string
    type: string
  }

  [Types.SET_CURRENT_SEARCH_FOLDERS]: {
    folders: { path: string; name: string }[]
    path: string
    type: string
  }

  [Types.SET_CURRENT_SEARCH_FILES]: {
    files: any[]
    path: string
    type: string
  }

  [Types.SET_SEARCHED_FOLDERS]: {
    folders: { path: string; name: string }[]
    path: string
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
    tooltip: string
  }

  [Types.SET_SEARCH]: {
    type: string
  }
  [Types.CLEAR_SEARCH_FILTER]: {
    type: string
  }
  [Types.BACK_TO_SEARCH_RESULTS]: {
    type: string
  }
  [Types.SET_EMPTY_INDICATOR]: {
    type: string
    value: string
  }
  [Types.SET_FETCHING_RESOURCES]: {
    fetching: boolean
  }
  [Types.SET_COLUMN_LAYOUT]: {
    layout: string
  }
  [Types.DELETE_FILE]: {
    file: FileSelect
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
    case Types.SET_COLUMN_LAYOUT: {
      return {
        ...state,
        columnLayout: action.payload.layout,
      }
    }

    case Types.SET_FETCHING_RESOURCES: {
      return {
        ...state,
        fetchingResources: action.payload.fetching,
      }
    }

    case Types.DELETE_FILE: {
      const { type, previousPath, folder } = action.payload.file
      let folders = state.foldersState[type][previousPath]
      if (folders.length > 0) {
        folders = folders.filter((folderName) => {
          return `${folderName.path}/${folderName.name}` !== folder.path
        })

        return {
          ...state,
          foldersState: {
            ...state.foldersState,
            [type]: {
              [previousPath]: folders,
            },
          },
        }
      } else {
        return {
          ...state,
        }
      }
    }

    case Types.SET_FOLDERS: {
      const { type, path, folders } = action.payload

      return {
        ...state,
        foldersState: {
          ...state.foldersState,
          [type]: {
            [path]: folders,
          },
        },
      }
    }

    case Types.SET_CURRENT_SEARCH_FOLDERS: {
      const { type, folders, path } = action.payload

      return {
        ...state,
        currentSearchFolders: {
          [type]: {
            [path]: folders,
          },
        },
      }
    }

    case Types.SET_SEARCHED_FOLDERS: {
      const { type, path, folders } = action.payload

      if (state.searchedFoldersState[type]) {
        return {
          ...state,
          searchedFoldersState: {
            ...state.searchedFoldersState,
            [type]: [...state.searchedFoldersState[type], { [path]: folders }],
          },
        }
      }
      return {
        ...state,
        searchedFoldersState: {
          ...state.searchedFoldersState,
          [type]: [
            {
              [path]: folders,
            },
          ],
        },
      }
    }

    case Types.SET_SEARCH: {
      return {
        ...state,
        search: {
          ...state.search,
          [action.payload.type]: true,
        },
      }
    }

    case Types.CLEAR_SEARCH_FILTER: {
      return {
        ...state,
        emptySetIndicator: {},
        search: {
          ...state.search,
          [action.payload.type]: false,
        },
        currentSearchFiles: {
          [action.payload.type]: {},
        },
        currentSearchFolders: {
          [action.payload.type]: {},
        },
        searchPath: {
          [action.payload.type]: '',
        },
        searchedFoldersState: {
          ...state.searchedFoldersState,
          [action.payload.type]: [],
        },
      }
    }

    case Types.BACK_TO_SEARCH_RESULTS: {
      return {
        ...state,
        searchPath: {
          ...state.searchPath,
          [action.payload.type]: '',
        },
        currentSearchFiles: {
          [action.payload.type]: {},
        },
        currentSearchFolders: {
          [action.payload.type]: {},
        },
      }
    }

    case Types.SET_CURRENT_PATH: {
      const { type, path } = action.payload
      return {
        ...state,
        currentPath: {
          ...state.currentPath,
          [type]: path,
        },
      }
    }

    case Types.SET_CURRENT_PATH_SEARCH: {
      const { type, path } = action.payload
      return {
        ...state,
        searchPath: {
          [type]: path,
        },
      }
    }

    case Types.SET_FILES: {
      const { path, type, files } = action.payload
      return {
        ...state,
        filesState: {
          ...state.filesState,
          [type]: {
            [path]: files,
          },
        },
      }
    }

    case Types.SET_CURRENT_SEARCH_FILES: {
      const { type, files, path } = action.payload

      return {
        ...state,
        currentSearchFiles: {
          ...state.currentSearchFiles,
          [type]: {
            [path]: files,
          },
        },
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
        operation,
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
      const type = 'uploads'
      const folderDetails = {
        name: folder,
        path,
      }

      if (state.foldersState[type] && state.foldersState[type][path]) {
        const previousFolders = state.foldersState[type][path]

        return {
          ...state,
          foldersState: {
            ...state.foldersState,
            [type]: {
              [path]: [...previousFolders, folderDetails],
            },
          },
        }
      } else {
        return {
          ...state,
          foldersState: {
            ...state.foldersState,
            [type]: {
              [path]: [folderDetails],
            },
          },
        }
      }
    }

    case Types.SET_EMPTY_INDICATOR: {
      const { type, value } = action.payload
      return {
        ...state,
        emptySetIndicator: {
          [type]: value,
        },
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
