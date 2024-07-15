import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { Types } from ".";

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
