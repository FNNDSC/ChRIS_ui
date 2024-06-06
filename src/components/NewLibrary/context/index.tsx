import { FileBrowserFolder, FileBrowserFolderFile } from "@fnndsc/chrisapi";
import React, { createContext, useReducer } from "react";

export interface SelectionPayload {
  path: string;
  type: string;
  payload: FileBrowserFolderFile | FileBrowserFolder;
}

export interface LibraryState {
  openCart: boolean;
  selectedPaths: SelectionPayload[];
  previewAll: boolean;
  fileDownloadStatus: {
    [key: string]: DownloadTypes;
  };
  folderDownloadStatus: {
    [key: string]: {
      status: FolderDownloadTypes;
      pipelineType: string;
    };
  };
}

function getInitialState(): LibraryState {
  return {
    openCart: false,
    selectedPaths: [],
    previewAll: false,
    fileDownloadStatus: {},
    folderDownloadStatus: {},
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
  SET_SELECTED_PATHS = "SET_SELECTED_PATHS",
  SET_SELECTED_PATHS_FROM_COOKIES = "SET_SELECTED_PATHS_FROM_COOKIES",
  SET_FOLDER_DOWNLOAD_FROM_COOKIES = "SET_FOLDER_DOWNLOAD_FROM_COOKIES",
  CLEAR_SELECTED_PATHS = "CLEAR_SELECTED_PATHS",
  SET_PREVIEW_ALL = "SET_PREVIEW_ALL",
  CLEAR_CART = "CLEAR_CART",
  SET_FILE_DOWNLOAD_STATUS = "SET_FILE_DOWNLOAD_STATUS",
  SET_FOLDER_DOWNLOAD_STATUS = "SET_FOLDER_DOWNLOAD_STATUS",
  CLEAR_DOWNLOAD_FILE_STATUS = "CLEAR_DOWNLOAD_FILE_STATUS",
  CLEAR_DOWNLOAD_FOLDER_STATUS = "CLEAR_DOWNLOAD_FOLDER_STATUS",
  SET_TOGGLE_CART = "SET_TOGGLE_CART",
}

export enum DownloadTypes {
  started = "STARTED",
  progress = "PROGRESS",
  finished = "FINISHED",
  cancelled = "CANCELLED",
}

export enum FolderDownloadTypes {
  started = "STARTED",
  creatingFeed = "CREATING_FEED",
  zippingFolder = "ZIPPING_FOLDER",
  startingDownload = "STARTING_DOWNLOAD",
  finished = "FINISHED",
  cancelled = "CANCELLED",
}

export type LibraryPayload = {
  [Types.SET_SELECTED_PATHS]: {
    path: string;
    type: string;
    payload: FileBrowserFolderFile | FileBrowserFolder;
  };
  [Types.SET_SELECTED_PATHS_FROM_COOKIES]: {
    paths: SelectionPayload[];
  };

  [Types.SET_FOLDER_DOWNLOAD_FROM_COOKIES]: {
    status: {
      [key: string]: {
        status: FolderDownloadTypes;
        pipelineType: string;
      };
    };
  };

  [Types.CLEAR_SELECTED_PATHS]: {
    path: string;
  };
  [Types.SET_PREVIEW_ALL]: {
    previewAll: boolean;
  };
  [Types.CLEAR_CART]: Record<any, unknown>;

  [Types.SET_FILE_DOWNLOAD_STATUS]: {
    id: number;
    status: DownloadTypes;
  };

  [Types.SET_FOLDER_DOWNLOAD_STATUS]: {
    id: number;
    status: FolderDownloadTypes;
    pipelineType: string;
  };

  [Types.CLEAR_DOWNLOAD_FILE_STATUS]: {
    id: string;
  };
  [Types.CLEAR_DOWNLOAD_FOLDER_STATUS]: {
    id: string;
  };

  [Types.SET_TOGGLE_CART]: null;
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
  action: LibraryActions,
): LibraryState => {
  switch (action.type) {
    case Types.SET_FILE_DOWNLOAD_STATUS: {
      const { id, status } = action.payload;
      return {
        ...state,
        fileDownloadStatus: {
          ...state.fileDownloadStatus,
          [id]: status,
        },
      };
    }

    case Types.CLEAR_DOWNLOAD_FILE_STATUS: {
      const { id } = action.payload;
      const fileDownloadStatus = { ...state.fileDownloadStatus };
      delete fileDownloadStatus[id];

      return {
        ...state,
        fileDownloadStatus,
      };
    }

    case Types.CLEAR_DOWNLOAD_FOLDER_STATUS: {
      const { id } = action.payload;
      const folderDownloadStatus = { ...state.folderDownloadStatus };
      delete folderDownloadStatus[id];

      return {
        ...state,
        folderDownloadStatus,
      };
    }

    case Types.SET_FOLDER_DOWNLOAD_STATUS: {
      const { id, status, pipelineType } = action.payload;

      return {
        ...state,
        folderDownloadStatus: {
          ...state.folderDownloadStatus,
          [id]: {
            status,
            pipelineType,
          },
        },
      };
    }

    case Types.SET_SELECTED_PATHS: {
      return {
        ...state,
        selectedPaths: [...state.selectedPaths, action.payload],
      };
    }

    case Types.SET_SELECTED_PATHS_FROM_COOKIES: {
      return {
        ...state,
        selectedPaths: [...action.payload.paths],
      };
    }

    case Types.SET_FOLDER_DOWNLOAD_FROM_COOKIES: {
      return {
        ...state,
        folderDownloadStatus: action.payload.status,
      };
    }

    case Types.CLEAR_SELECTED_PATHS: {
      const newSelectedPaths = state.selectedPaths.filter((pathObj) => {
        return pathObj.path !== action.payload.path;
      });
      return {
        ...state,
        selectedPaths: newSelectedPaths,
      };
    }

    case Types.CLEAR_CART: {
      return {
        ...state,
        selectedPaths: [],
        fileDownloadStatus: {},
        folderDownloadStatus: {},
      };
    }

    case Types.SET_TOGGLE_CART: {
      return {
        ...state,
        openCart: !state.openCart,
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
