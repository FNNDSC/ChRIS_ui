import React, { createContext, useReducer } from "react";

export interface Paginated {
  hasNext: boolean;
  limit: number;
  offset: number;
  totalCount: number;
}

interface LibraryState {
  initialPath: {
    [key: string]: string;
  };
  filesState: {
    [key: string]: any[];
  };
  foldersState: {
    [key: string]: string[];
  };
  folderDetails: {
    currentFolder: string;
    totalCount: number;
  };
  paginated: {
    [key: string]: Paginated;
  };
  previewAll: boolean;
  loading: boolean;
  isRoot: {
    [key: string]: boolean;
  };
  paginatedFolders: {
    [key: string]: string[];
  };
}

function getInitialState(): LibraryState {
  return {
    isRoot: {},
    initialPath: {},
    filesState: {},
    foldersState: {},
    folderDetails: {
      currentFolder: "",
      totalCount: 0,
    },
    paginated: {},
    previewAll: false,
    loading: false,
    paginatedFolders: {},
  };
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  SET_FILES = "SET_FILES",
  SET_FOLDERS = "SET_FOLDERS",
  SET_PAGINATED_FOLDERS = "SET_PAGINATED_FOLDERS",
  SET_INITIAL_PATH = "SET_INITIAL_PATH",
  SET_PAGINATION = "SET_PAGINATION",
  SET_LOADING = "SET_LOADING",
  SET_FOLDER_DETAILS = "SET_FOLDER_DETAILS",
  SET_PREVIEW_ALL = "SET_PREVIEW_ALL",
  SET_ADD_FOLDER = "SET_ADD_FOLDER",
  SET_ROOT = "SET_ROOT",
}

type LibraryPayload = {
  [Types.SET_FILES]: {
    files: any[];
    type: string;
  };
  [Types.SET_FOLDERS]: {
    folders: string[];
    type: string;
  };

  [Types.SET_INITIAL_PATH]: {
    path: string;
    type: string;
  };
  [Types.SET_PAGINATION]: {
    path: string;
    hasNext: boolean;
    limit: number;
    offset: number;
    totalCount: number;
  };
  [Types.SET_PAGINATED_FOLDERS]: {
    folders: string[];
    path: string;
  };
  [Types.SET_LOADING]: {
    loading: false;
  };
  [Types.SET_FOLDER_DETAILS]: {
    currentFolder: string;
    totalCount: number;
  };
  [Types.SET_PREVIEW_ALL]: {
    previewAll: boolean;
  };

  [Types.SET_ADD_FOLDER]: {
    folder: string;
    username: string | null | undefined;
  };
  [Types.SET_ROOT]: {
    isRoot: boolean;
    type: string;
  };
};

export type LibraryActions =
  ActionMap<LibraryPayload>[keyof ActionMap<LibraryPayload>];

const LibraryContext = createContext<{
  state: LibraryState;
  dispatch: React.Dispatch<any>;
}>({
  state: getInitialState(),
  dispatch: () => null,
});

export const libraryReducer = (
  state: LibraryState,
  action: LibraryActions
): LibraryState => {
  switch (action.type) {
    case Types.SET_INITIAL_PATH: {
      return {
        ...state,
        initialPath: {
          ...state.initialPath,
          [action.payload.type]: action.payload.path,
        },
      };
    }

    case Types.SET_PAGINATION: {
      const { path, hasNext, limit, offset, totalCount } = action.payload;

      return {
        ...state,
        paginated: {
          ...state.paginated,
          [path]: {
            hasNext,
            limit,
            offset,
            totalCount,
          },
        },
      };
    }

    case Types.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.loading,
      };
    }

    case Types.SET_FILES: {
      if (action.payload.files.length == 0) {
        return {
          ...state,
          filesState: {},
        };
      } else {
        return {
          ...state,
          filesState: {
            ...state.filesState,
            [action.payload.type]: action.payload.files,
          },
        };
      }
    }

    case Types.SET_FOLDERS: {
      return {
        ...state,
        foldersState: {
          ...state.foldersState,
          [action.payload.type]: action.payload.folders,
        },
      };
    }

    case Types.SET_PAGINATED_FOLDERS: {
      return {
        ...state,
        paginatedFolders: {
          ...state.paginatedFolders,
          [action.payload.path]: action.payload.folders,
        },
      };
    }

    case Types.SET_FOLDER_DETAILS: {
      return {
        ...state,
        folderDetails: {
          currentFolder: action.payload.currentFolder,
          totalCount: action.payload.totalCount,
        },
      };
    }

    case Types.SET_PREVIEW_ALL: {
      return {
        ...state,
        previewAll: action.payload.previewAll,
      };
    }

    case Types.SET_ADD_FOLDER: {
      const path = `${action.payload.username}/uploads`;
      return {
        ...state,
        foldersState: {
          ...state.foldersState,
          [path]: [...state.foldersState[path], action.payload.folder],
        },
        paginatedFolders: {
          ...state.paginatedFolders,
          [path]: [...state.foldersState[path], action.payload.folder],
        },
      };
    }

    case Types.SET_ROOT: {
      if (action.payload.isRoot === false) {
        return {
          ...state,
          isRoot: {},
        };
      }
      return {
        ...state,
        isRoot: {
          ...state.isRoot,
          [action.payload.type]: action.payload.isRoot,
        },
      };
    }

    default:
      return state;
  }
};

interface LibraryProviderProps {
  children: React.ReactNode;
}

const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const initialState = getInitialState();
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  );
};

export { LibraryContext, LibraryProvider };
