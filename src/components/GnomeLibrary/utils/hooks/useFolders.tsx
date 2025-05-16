import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
} from "@fnndsc/chrisapi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ChrisAPIClient from "../../../../api/chrisapiclient";

// Define the interface for pagination
interface PaginationInfo {
  totalCount: number;
  hasNextPage: boolean;
}

// Define the interface for data expected by GnomeLibraryTable
export interface FolderTableData {
  folders: FileBrowserFolder[];
  files: FileBrowserFolderFile[];
  linkFiles: FileBrowserFolderLinkFile[];
  filesPagination?: PaginationInfo;
  foldersPagination?: PaginationInfo;
  linksPagination?: PaginationInfo;
}

// Extended interface for our hook's return data
export interface FolderHookData extends FolderTableData {
  folderList?: FileBrowserFolderList;
  errorMessages?: string[];
}

export async function fetchFolders(
  computedPath: string,
  pageNumber?: number,
): Promise<FolderHookData> {
  const client = ChrisAPIClient.getClient();
  await client.setUrls();

  const pagination = {
    limit: pageNumber ? pageNumber * 50 : 100,
    offset: 0,
  };

  const errorMessages: string[] = [];

  try {
    const folderList: FileBrowserFolderList =
      await client.getFileBrowserFolders({
        path: computedPath,
      });

    const folders = folderList.getItems() as FileBrowserFolder[];
    let subFolders: FileBrowserFolder[] = [];
    let linkFiles: FileBrowserFolderLinkFile[] = [];
    let files: FileBrowserFolderFile[] = [];
    const initialPaginateValue: PaginationInfo = {
      totalCount: 0,
      hasNextPage: false,
    };
    let filesPagination = initialPaginateValue;
    let foldersPagination = initialPaginateValue;
    let linksPagination = initialPaginateValue;

    if (folders && folders.length > 0) {
      const folder = folders[0];

      if (folder) {
        // Prepare fetch promises for parallel execution
        const fetchPromises = [
          // Fetch children folders
          folder
            .getChildren(pagination)
            .then((children) => {
              subFolders = children.getItems() as FileBrowserFolder[];
              foldersPagination = {
                totalCount: children.totalCount,
                hasNextPage: children.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching folder children:", error);
              errorMessages.push("Failed to fetch subfolders.");
            }),

          // Fetch link files
          folder
            .getLinkFiles(pagination)
            .then((linkFilesResult) => {
              linkFiles =
                linkFilesResult.getItems() as FileBrowserFolderLinkFile[];
              linksPagination = {
                totalCount: linkFilesResult.totalCount,
                hasNextPage: linkFilesResult.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching link files:", error);
              errorMessages.push("Failed to fetch link files.");
            }),

          // Fetch folder files
          folder
            .getFiles(pagination)
            .then((folderFiles) => {
              files = folderFiles.getItems() as FileBrowserFolderFile[];
              filesPagination = {
                totalCount: folderFiles.totalCount,
                hasNextPage: folderFiles.hasNextPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching files:", error);
              errorMessages.push("Failed to fetch files.");
            }),
        ];

        await Promise.all(fetchPromises);
      }
    }

    return {
      folders: subFolders,
      files,
      linkFiles,
      filesPagination,
      foldersPagination,
      linksPagination,
      folderList,
      errorMessages,
    };
  } catch (e) {
    errorMessages.push("Failed to load folder list.");
    return {
      folders: [],
      files: [],
      linkFiles: [],
      errorMessages,
    };
  }
}

/**
 * Hook for loading folders in the GnomeLibrary
 */
export const useFolders = (computedPath: string, pageNumber?: number) => {
  return useQuery({
    queryKey: ["library_folders", computedPath, pageNumber],
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });
};

export default useFolders;
