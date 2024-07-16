import { action } from "typesafe-actions";
import { ICartActionTypes, type SelectionPayload } from "./types";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";

//Type to be determined
export const setSelectFolder = (selectPayload: {
  path: string;
  type: string;
  payload: FileBrowserFolder | FileBrowserFolderFile;
}) => action(ICartActionTypes.SET_SELECTED_PATHS, selectPayload);

export const clearSelectFolder = (path: string) =>
  action(ICartActionTypes.CLEAR_SELECTED_PATHS, path);

export const setToggleCart = () => action(ICartActionTypes.SET_TOGGLE_CART);

export const startDownload = (paths: SelectionPayload[]) =>
  action(ICartActionTypes.START_DOWNLOAD, paths);

export const setFileDownloadStatus = (step: string) =>
  action(ICartActionTypes.SET_FILE_DOWNLOAD_STATUS, step);

export const setFolderDownloadStatus = (step: string) =>
  action(ICartActionTypes.SET_FOLDER_DOWNLOAD_STATUS, step);
