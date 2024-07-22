import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { action } from "typesafe-actions";
import {
  type FileUpload,
  type FolderUpload,
  ICartActionTypes,
  type SelectionPayload,
  type UploadPayload,
} from "./types";

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

export const setFileDownloadStatus = (payload: {
  id: number;
  step: string;
}) => action(ICartActionTypes.SET_FILE_DOWNLOAD_STATUS, payload);

export const setFolderDownloadStatus = (payload: {
  id: number;
  step: string;
}) => action(ICartActionTypes.SET_FOLDER_DOWNLOAD_STATUS, payload);

export const startUpload = (payload: UploadPayload) =>
  action(ICartActionTypes.START_UPLOAD, payload);

export const startAnonymize = (payload: {
  fileUpload: FileUpload;
  folderUpload: FolderUpload;
}) => action(ICartActionTypes.START_ANONYMIZE, payload);

export const setFileUploadStatus = (payload: {
  step: string;
  fileName: string;
  progress: number;
  controller: AbortController;
  path: string;
  type: string;
}) => action(ICartActionTypes.SET_FILE_UPLOAD_STATUS, payload);

export const setFolderUploadStatus = (payload: {
  step: string;
  fileName: string;
  totalCount: number;
  currentCount: number;
  controller: AbortController;
  path: string;
  type: string;
}) => action(ICartActionTypes.SET_FOLDER_UPLOAD_STATUS, payload);

export const setBulkSelectPaths = (payload: SelectionPayload[]) =>
  action(ICartActionTypes.SET_BULK_SELECTED_PATHS, payload);

export const clearDownloadStatus = (path: string) =>
  action(ICartActionTypes.CLEAR_DOWNLOAD_STATUS, path);
