import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { action } from "typesafe-actions";
import {
  type FeedCreationStatus,
  ICartActionTypes,
  type SelectionPayload,
  type UploadPayload,
} from "./types";

type OperationPayload = {
  paths: SelectionPayload[];
  username: string;
};

//Type to be determined
export const setSelectFolder = (selectPayload: {
  path: string;
  type: string;
  payload: FileBrowserFolder | FileBrowserFolderFile;
}) => action(ICartActionTypes.SET_SELECTED_PATHS, selectPayload);

export const clearSelectFolder = (path: string) =>
  action(ICartActionTypes.CLEAR_SELECTED_PATHS, path);

export const setToggleCart = () => action(ICartActionTypes.SET_TOGGLE_CART);

export const startDownload = (payload: OperationPayload) =>
  action(ICartActionTypes.START_DOWNLOAD, payload);

export const setFileDownloadStatus = (payload: {
  id: number;
  step: string;
  fileName: string;
  error?: string;
}) => action(ICartActionTypes.SET_FILE_DOWNLOAD_STATUS, payload);

export const setFolderDownloadStatus = (payload: {
  id: number;
  step: string;
  fileName?: string;
  error?: string;
  feed?: Feed;
}) => action(ICartActionTypes.SET_FOLDER_DOWNLOAD_STATUS, payload);

export const startUpload = (payload: UploadPayload) =>
  action(ICartActionTypes.START_UPLOAD, payload);

export const startAnonymize = (payload: OperationPayload) =>
  action(ICartActionTypes.START_ANONYMIZE, payload);

export const clearFeedCreationStatus = () =>
  action(ICartActionTypes.CLEAR_FEED_STATE);

export const setFileUploadStatus = (payload: {
  step: string;
  fileName: string;
  progress: number;
  controller: AbortController | null;
  path: string;
  type: string;
}) => action(ICartActionTypes.SET_FILE_UPLOAD_STATUS, payload);

export const setFolderUploadStatus = (payload: {
  step: string;
  fileName: string;
  totalCount: number;
  currentCount: number;
  controller: AbortController | null;
  path: string;
  type: string;
}) => action(ICartActionTypes.SET_FOLDER_UPLOAD_STATUS, payload);

export const setBulkSelectPaths = (payload: SelectionPayload[]) =>
  action(ICartActionTypes.SET_BULK_SELECTED_PATHS, payload);

export const clearDownloadStatus = (payload: {
  path: string;
  type: string;
}) => action(ICartActionTypes.CLEAR_DOWNLOAD_STATUS, payload);

export const removeIndividualSelection = (payload: SelectionPayload) =>
  action(ICartActionTypes.REMOVE_SELECTED_PAYLOAD, payload);

export const clearUploadState = (payload: { type: string; id: string }) =>
  action(ICartActionTypes.CLEAR_UPLOAD_STATE, payload);

export const cancelUpload = (payload: { type: string; id: string }) =>
  action(ICartActionTypes.CANCEL_UPLOAD, payload);
export const clearCart = () => action(ICartActionTypes.CLEAR_CART);
