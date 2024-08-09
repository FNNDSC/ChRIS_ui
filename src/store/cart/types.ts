import keyMirror from "keymirror";
import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";

export interface SelectionPayload {
  path: string;
  type: string;
  payload: FileBrowserFolderFile | FileBrowserFolder;
}

export type FolderUploadObject = {
  currentStep: string;
  done: number;
  total: number;
  controller: AbortController;
  path: string;
  type: string;
};

export type FileUploadObject = {
  currentStep: string;
  progress: number;
  controller: AbortController;
  path: string;
  type: string;
};

export interface FolderUpload {
  [key: string]: FolderUploadObject;
}

export interface FileUpload {
  [key: string]: FileUploadObject;
}

export enum DownloadTypes {
  started = "started",
  progress = "processing",
  finished = "finished",
  cancelled = "cancelled",
}

export type DownloadStatus = {
  [key: string]: {
    step: DownloadTypes;
    error?: string;
    fileName: string;
    feed?: Feed;
  };
};

export interface FeedCreationStatus {
  type: string;
  folder_path: string;
  feed_id: number;
}

export interface ICartState {
  selectedPaths: SelectionPayload[];
  openCart: boolean;
  folderDownloadStatus: DownloadStatus;
  fileDownloadStatus: DownloadStatus;
  folderUploadStatus: FolderUpload;
  fileUploadStatus: FileUpload;
}

export interface UploadPayload {
  files: File[];
  isFolder: boolean;
  currentPath: string;
}

export const ICartActionTypes = keyMirror({
  SET_SELECTED_PATHS: null,
  SET_BULK_SELECTED_PATHS: null,
  CLEAR_SELECTED_PATHS: null,
  CLEAR_CART: null,
  CLEAR_UPLOAD_STATE: null,
  SET_TOGGLE_CART: null,
  START_DOWNLOAD: null,
  CREATE_FEED: null,
  CREATE_FEED_SUCCESS: null,
  SET_FILE_DOWNLOAD_STATUS: null,
  SET_FOLDER_DOWNLOAD_STATUS: null,
  START_UPLOAD: null,
  START_ANONYMIZE: null,
  SET_FILE_UPLOAD_STATUS: null,
  SET_FOLDER_UPLOAD_STATUS: null,
  CLEAR_DOWNLOAD_STATUS: null,
  REMOVE_SELECTED_PAYLOAD: null,
  CANCEL_UPLOAD: null,
  CLEAR_FEED_STATE: null,
});
