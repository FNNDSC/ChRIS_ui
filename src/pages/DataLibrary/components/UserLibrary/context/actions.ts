import { FileSelect, Types } from './index'

export const setInitialPath = (path: string, type: string) => {
  return {
    type: Types.SET_INITIAL_PATH,
    payload: {
      path,
      type,
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

export const setLoading = (loading: boolean) => {
  return {
    type: Types.SET_LOADING,
    payload: {
      loading,
    },
  }
}

export const setFolders = (folders: any[], type: string) => {
  return {
    type: Types.SET_FOLDERS,
    payload: {
      folders,
      type,
    },
  }
}

export const setPaginatedFolders = (folders: any[], path: string) => {
  return {
    type: Types.SET_PAGINATED_FOLDERS,
    payload: {
      folders,
      path,
    },
  }
}

export const setFiles = (files: any[], type: string) => {
  return {
    type: Types.SET_FILES,
    payload: {
      files,
      type,
    },
  }
}

export const setPagination = (
  path: string,
  pagination: {
    hasNext: boolean
    limit: number
    offset: number
    totalCount: number
  },
) => {
  return {
    type: Types.SET_PAGINATION,
    payload: {
      path,
      hasNext: pagination.hasNext,
      limit: pagination.limit,
      offset: pagination.offset,
      totalCount: pagination.totalCount,
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

export const setSelectFolder = (
  payload: FileSelect & {
    event: string
  },
) => {
  return {
    type: Types.SET_SELECTED_FOLDER,
    payload: {
      selectFolder: payload,
    },
  }
}
