import keyMirror from "keymirror";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";

export interface SelectionPayload {
  path: string;
  type: string;
  payload: FileBrowserFolderFile | FileBrowserFolder;
}

export interface FolderUpload {
  [key: string]: {
    currentStep: string;
    done: number;
    total: number;
    controller: AbortController;
  };
}

export interface FileUpload {
  [key: string]: {
    currentStep: string;
    progress: number;
    controller: AbortController;
  };
}

export interface ICartState {
  selectedPaths: SelectionPayload[];
  openCart: boolean;
  folderDownloadStatus: {
    [key: string]: string;
  };
  fileDownloadStatus: {
    [key: string]: string;
  };
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
  CLEAR_SELECTED_PATHS: null,
  CLEAR_CART: null,
  SET_TOGGLE_CART: null,
  START_DOWNLOAD: null,
  SET_FILE_DOWNLOAD_STATUS: null,
  SET_FOLDER_DOWNLOAD_STATUS: null,
  START_UPLOAD: null,
  SET_FILE_UPLOAD_STATUS: null,
  SET_FOLDER_UPLOAD_STATUS: null,
});
