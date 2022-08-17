import { FileSelect, Types } from './index'

export const setFetching = (fetching: boolean) => {
  return {
    type: Types.SET_FETCHING_RESOURCES,
    payload: {
      fetching,
    },
  }
}

export const setCurrentPath = (path: string, type: string) => {
  return {
    type: Types.SET_CURRENT_PATH,
    payload: {
      path,
      type,
    },
  }
}

export const setMultiColumnLayout = (layout: string) => {
  return {
    type: Types.SET_COLUMN_LAYOUT,
    payload: {
      layout,
    },
  }
}

export const setCurrentPathSearch = (path: string, type: string) => {
  return {
    type: Types.SET_CURRENT_PATH_SEARCH,
    payload: {
      path,
      type,
    },
  }
}

export const setSearch = (type: string) => {
  return {
    type: Types.SET_SEARCH,
    payload: {
      type,
    },
  }
}

export const clearSearchFilter = (type: string) => {
  return {
    type: Types.CLEAR_SEARCH_FILTER,
    payload: {
      type,
    },
  }
}

export const backToSearchResults = (type: string) => {
  return {
    type: Types.BACK_TO_SEARCH_RESULTS,
    payload: {
      type,
    },
  }
}

export const setTogglePreview = (previewAll: boolean) => {
  return {
    type: Types.SET_PREVIEW_ALL,
    payload: {
      previewAll,
    },
  }
}

export const clearFolderState = (path: string, type: string) => {
  return {
    type: Types.CLEAR_FOLDER_STATE,
    payload: {
      path,
      type,
    },
  }
}

export const clearFilesState = (path: string, type: string) => {
  return {
    type: Types.CLEAR_FILES_STATE,
    payload: {
      path,
      type,
    },
  }
}

export const setFolders = (folders: any[], path: string, type: string) => {
  return {
    type: Types.SET_FOLDERS,
    payload: {
      folders,
      path,
      type,
    },
  }
}

export const setSearchedFolders = (
  folders: any[],
  path: string,
  type: string,
) => {
  return {
    type: Types.SET_SEARCHED_FOLDERS,
    payload: {
      folders,
      path,
      type,
    },
  }
}

export const setCurrentSearchFolder = (
  folders: any[],
  path: string,
  type: string,
) => {
  return {
    type: Types.SET_CURRENT_SEARCH_FOLDERS,
    payload: {
      folders,
      path,
      type,
    },
  }
}

export const setCurrentSearchFiles = (
  files: any[],
  path: string,
  type: string,
) => {
  return {
    type: Types.SET_CURRENT_SEARCH_FILES,
    payload: {
      files,
      path,
      type,
    },
  }
}

export const setFiles = (files: any[], path: string, type: string) => {
  return {
    type: Types.SET_FILES,
    payload: {
      files,
      path,
      type,
    },
  }
}

export const clearSelectFolder = (file: FileSelect) => {
  return {
    type: Types.CLEAR_SELECTED_FOLDER,
    payload: {
      selectFolder: file,
    },
  }
}

export const setSelectFolder = (payload: FileSelect) => {
  return {
    type: Types.SET_SELECTED_FOLDER,
    payload: {
      selectFolder: payload,
    },
  }
}

export const setFolderDetails = (totalCount: number, currentFolder: string) => {
  return {
    type: Types.SET_FOLDER_DETAILS,
    payload: {
      totalCount,
      currentFolder,
    },
  }
}

export const setHideTooltip = (tooltip: string) => {
  return {
    type: Types.SET_TOOLTIP,
    payload: {
      tooltip,
    },
  }
}

export const setEmptySetIndicator = (type: string, value: string) => {
  return {
    type: Types.SET_EMPTY_INDICATOR,
    payload: {
      type,
      value,
    },
  }
}
