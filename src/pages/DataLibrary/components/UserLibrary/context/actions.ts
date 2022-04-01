import { Types } from "./index";

export const setInitialPath = (path: string, type: string) => {
  return {
    type: Types.SET_INITIAL_PATH,
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

export const setFolders = (folders: any[], type: string) => {
  return {
    type: Types.SET_FOLDERS,
    payload: {
      folders,
      type,
    },
  };
};

export const setFiles = (files: any[], type: string) => {
  return {
    type: Types.SET_FILES,
    payload: {
      files,
      type,
    },
  };
};

export const setPagination = (
  path: string,
  pagination: {
    hasNext: boolean;
    limit: number;
    offset: number;
  }
) => {
  return {
    type: Types.SET_PAGINATION,
    payload: {
      path,
      pagination,
    },
  };
};

export const setRoot = (isRoot: boolean, type: string) => {
  return {
    type: Types.SET_ROOT,
    payload: {
      isRoot,
      type,
    },
  };
};
