import { FileBrowserFolder, FileBrowserFolderFile } from "@fnndsc/chrisapi";
import { Types, DownloadTypes } from ".";

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
  status: "STARTED" | "FINISHED" | "PROGRESS",
) => {
  return {
    type: Types.SET_FILE_DOWNLOAD_STATUS,
    payload: {
      id: file.data.id,
      status,
    },
  };
};
