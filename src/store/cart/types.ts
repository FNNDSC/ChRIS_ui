import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";

export type PayloadTypes =
  | FileBrowserFolder
  | FileBrowserFolderFile
  | FileBrowserFolderLinkFile;

export interface SelectionPayload {
  path: string;
  type: string;
  payload: PayloadTypes;
}

export type FolderUploadObject = {
  currentStep: string;
  done: number;
  total: number;
  controller: AbortController | null;
  path: string;
  type: string;
};

export type FileUploadObject = {
  currentStep: string;
  progress: number;
  controller: AbortController | null;
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
    fileName?: string;
    feed?: Feed;
  };
};

export interface FeedCreationStatus {
  type: string;
  folder_path: string;
  feed_id: number;
}

export interface ICartState {
  currentLayout: "grid" | "list";
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

export type OperationPayload = {
  paths: SelectionPayload[];
  username: string;
};
