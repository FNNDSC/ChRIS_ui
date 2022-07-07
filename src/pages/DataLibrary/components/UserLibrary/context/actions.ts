import { FileSelect, Types } from "./index";

export const setCurrentPath = (path: string, type: string) => {
  return {
    type: Types.SET_CURRENT_PATH,
    payload: {
      path,
      type,
    },
  };
};

export const setCurrentPathSearch = (paths: string[], type: string) => {
  return {
    type: Types.SET_CURRENT_PATH_SEARCH,
    payload: {
      paths,
      type,
    },
  };
};

export const setSearch = (type: string) => {
  return {
    type: Types.SET_SEARCH,
    payload: {
      type,
    },
  };
};

export const setTogglePreview = (previewAll: boolean) => {
  return {
    type: Types.SET_PREVIEW_ALL,
    payload: {
      previewAll,
    },
  };
};

export const clearFolderState = (path: string, type: string) => {
  return {
    type: Types.CLEAR_FOLDER_STATE,
    payload: {
      path,
      type,
    },
  };
};

export const clearFilesState = (path: string, type: string) => {
  return {
    type: Types.CLEAR_FILES_STATE,
    payload: {
      path,
      type,
    },
  };
};

export const setLoading = (loading: boolean) => {
  return {
    type: Types.SET_LOADING,
    payload: {
      loading,
    },
  };
};

export const setFolders = (folders: any[], path: string) => {
  return {
    type: Types.SET_FOLDERS,
    payload: {
      folders,
      path,
    },
  };
};

export const setSearchedFolders = (folders: any[], type: string) => {
  return {
    type: Types.SET_SEARCHED_FOLDERS,
    payload: {
      folders,
      type,
    },
  };
};

export const setFiles = (files: any[], path: string) => {
  return {
    type: Types.SET_FILES,
    payload: {
      files,
      path,
    },
  };
};

export const clearSelectFolder = (file: FileSelect) => {
  return {
    type: Types.CLEAR_SELECTED_FOLDER,
    payload: {
      selectFolder: file,
    },
  };
};

export const setSelectFolder = (payload: FileSelect) => {
  return {
    type: Types.SET_SELECTED_FOLDER,
    payload: {
      selectFolder: payload,
    },
  };
};

export const setFolderDetails = (totalCount: number, currentFolder: string) => {
  return {
    type: Types.SET_FOLDER_DETAILS,
    payload: {
      totalCount,
      currentFolder,
    },
  };
};

export const setHideTooltip = (tooltip: boolean) => {
  return {
    type: Types.SET_TOOLTIP,
    payload: {
      tooltip,
    },
  };
};
