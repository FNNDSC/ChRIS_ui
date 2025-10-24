import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
} from "@fnndsc/chrisapi";

export interface FilesPayload {
  filesMap?: FileBrowserFolderFile[];
  subFoldersMap?: FileBrowserFolder[];
  linkFilesMap?: FileBrowserFolderLinkFile[];
  folderList?: FileBrowserFolderList;
  filesPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
  linksPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
  foldersPagination?: {
    totalCount: number;
    hasNextPage: boolean;
  };
}

export interface Label {
  [key: string]: boolean;
}
