import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
  PluginInstance,
} from "@fnndsc/chrisapi";
import type { DataNode } from "../../store/explorer/types";

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

export interface FileBrowserProps {
  pluginFilesPayload: FilesPayload;
  handleFileClick: (path: string) => void;
  selected: PluginInstance;
  currentPath: string;
  isLoading: boolean;
  handlePagination: () => void;
  fetchMore?: boolean;
  observerTarget?: React.MutableRefObject<any>;
}

export interface FileBrowserState {
  directory: DataNode;
  breadcrumbs: DataNode[];
  currentFile: DataNode[];
  previewingFile?: DataNode; // file selected for preview
}

export interface Label {
  [key: string]: boolean;
}
