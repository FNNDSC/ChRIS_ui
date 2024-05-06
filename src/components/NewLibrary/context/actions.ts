import { FileBrowserFolder, FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { Types, DownloadTypes, FolderDownloadTypes } from ".";

export const setSelectFolder = (
  path: string,
  type: string,
  userSelection: FileBrowserFolder | FileBrowserFolderFile,
) => {
  return {
    type: Types.SET_SELECTED_PATHS,
    payload: {
      path,
      type,
      payload: userSelection,
    },
  };
};

export const clearSelectFolder = (path: string) => {
  return {
    type: Types.CLEAR_SELECTED_PATHS,
    payload: {
      path,
    },
  };
};

export const clearCart = () => {
  return {
    type: Types.CLEAR_CART,
  };
};

export const downloadFileStatus = (
  file: FileBrowserFolderFile,
  status: DownloadTypes,
) => {
  return {
    type: Types.SET_FILE_DOWNLOAD_STATUS,
    payload: {
      id: file.data.id,
      status,
    },
  };
};

export const downloadFolderStatus = (
  folder: FileBrowserFolder,
  status: FolderDownloadTypes,
) => {
  return {
    type: Types.SET_FOLDER_DOWNLOAD_STATUS,
    payload: {
      id: folder.data.id,
      status,
    },
  };
};

export const clearDownloadFileStatus = () => {
  return {
    type: Types.CLEAR_DOWNLOAD_FILE_STATUS,
  };
};

export const clearDownloadFolderStaus = () => {
  return {
    type: Types.CLEAR_DOWNLOAD_FOLDER_STATUS,
  };
};
