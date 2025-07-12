import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
  FileBrowserFolderList,
} from "@fnndsc/chrisapi";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import ChrisAPIClient from "../../../../api/chrisapiclient";

// Define the interface for pagination
interface PaginationInfo {
  totalCount: number;
  hasNextPage: boolean;
  currentPage: number;
  itemsPerPage: number;
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

/**
 * Fetches folder data from the API
 */
export async function fetchFolders(
  computedPath: string,
  pageNumber = 1,
  previousData?: FolderHookData,
  selectedFolder?: FileBrowserFolder,
): Promise<FolderHookData> {
  // Get the client instance with proper authentication
  const client = ChrisAPIClient.getClient();
  const itemsPerPage = 50;
  const errorMessages: string[] = [];

  try {
    // Only fetch folder list if we don't have a selectedFolder
    let folderList: FileBrowserFolderList | undefined;
    let folders: FileBrowserFolder[] = [];

    // Skip folder list fetching entirely when we have a selectedFolder
    if (!selectedFolder) {
      // If we have previous data and haven't changed paths, reuse the folder list
      if (previousData?.folderList && pageNumber > 1) {
        folderList = previousData.folderList;
        folders = folderList.getItems() as FileBrowserFolder[];
      } else {
        // Otherwise fetch the folder list
        folderList = await client.getFileBrowserFolders({
          path: computedPath,
        });
        folders = folderList.getItems() as FileBrowserFolder[];
      }
    }

    // Initialize data structures using previous data or empty arrays
    let subFolders = previousData?.folders || [];
    let linkFiles = previousData?.linkFiles || [];
    let files = previousData?.files || [];

    // Default pagination state
    const initialPaginateValue: PaginationInfo = {
      totalCount: 0,
      hasNextPage: false,
      currentPage: 1,
      itemsPerPage,
    };

    // Use previous pagination info or initialize with defaults
    let filesPagination = previousData?.filesPagination || initialPaginateValue;
    let foldersPagination =
      previousData?.foldersPagination || initialPaginateValue;
    let linksPagination = previousData?.linksPagination || initialPaginateValue;

    // Determine which folder to work with
    let folder: FileBrowserFolder | null = null;

    if (selectedFolder) {
      // Use the provided folder directly - no need to fetch folder list
      folder = selectedFolder;
    } else if (folders.length > 0) {
      // Use the first folder from the fetched list
      folder = folders[0];
    }

    if (folder) {
      // Prepare fetch promises array
      const fetchPromises: Promise<void>[] = [];

      // Determine if we need to fetch folders
      // First page OR have more folders to fetch
      const shouldFetchFolders =
        pageNumber === 1 ||
        (foldersPagination?.hasNextPage &&
          foldersPagination?.currentPage < pageNumber);

      if (shouldFetchFolders) {
        // Calculate proper offset for folders
        const folderOffset = pageNumber === 1 ? 0 : subFolders.length;

        fetchPromises.push(
          folder
            .getChildren({
              limit: itemsPerPage,
              offset: folderOffset,
            })
            .then((children) => {
              const newFolders = children.getItems() as FileBrowserFolder[];

              // Append new folders to existing ones if paginating
              if (pageNumber > 1) {
                subFolders = [...subFolders, ...newFolders];
              } else {
                // First page, replace entirely
                subFolders = newFolders;
              }

              // Update pagination info
              foldersPagination = {
                totalCount: children.totalCount,
                hasNextPage: children.hasNextPage,
                currentPage: pageNumber,
                itemsPerPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching folder children:", error);
              errorMessages.push("Failed to fetch subfolders.");
            }),
        );
      }

      // Determine if we need to fetch link files
      // First page OR have more link files to fetch
      const shouldFetchLinkFiles =
        pageNumber === 1 ||
        (linksPagination?.hasNextPage &&
          linksPagination?.currentPage < pageNumber);

      if (shouldFetchLinkFiles) {
        // Calculate proper offset for link files
        const linkOffset = pageNumber === 1 ? 0 : linkFiles.length;

        fetchPromises.push(
          folder
            .getLinkFiles({
              limit: itemsPerPage,
              offset: linkOffset,
            })
            .then((linkFilesResult) => {
              const newLinkFiles =
                linkFilesResult.getItems() as FileBrowserFolderLinkFile[];

              // Append new link files to existing ones if paginating
              if (pageNumber > 1) {
                linkFiles = [...linkFiles, ...newLinkFiles];
              } else {
                // First page, replace entirely
                linkFiles = newLinkFiles;
              }

              // Update pagination info
              linksPagination = {
                totalCount: linkFilesResult.totalCount,
                hasNextPage: linkFilesResult.hasNextPage,
                currentPage: pageNumber,
                itemsPerPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching link files:", error);
              errorMessages.push("Failed to fetch link files.");
            }),
        );
      }

      // Determine if we need to fetch regular files
      // First page OR have more files to fetch
      const shouldFetchFiles =
        pageNumber === 1 ||
        (filesPagination?.hasNextPage &&
          filesPagination?.currentPage < pageNumber);

      if (shouldFetchFiles) {
        // Calculate proper offset for files
        const fileOffset = pageNumber === 1 ? 0 : files.length;

        fetchPromises.push(
          folder
            .getFiles({
              limit: itemsPerPage,
              offset: fileOffset,
            })
            .then((folderFiles) => {
              const newFiles =
                folderFiles.getItems() as FileBrowserFolderFile[];

              // Append new files to existing ones if paginating
              if (pageNumber > 1) {
                files = [...files, ...newFiles];
              } else {
                // First page, replace entirely
                files = newFiles;
              }

              // Update pagination info
              filesPagination = {
                totalCount: folderFiles.totalCount,
                hasNextPage: folderFiles.hasNextPage,
                currentPage: pageNumber,
                itemsPerPage,
              };
            })
            .catch((error) => {
              console.error("Error fetching files:", error);
              errorMessages.push("Failed to fetch files.");
            }),
        );
      }

      // Only execute promises if we have any
      if (fetchPromises.length > 0) {
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
export const useFolders = (
  computedPath: string,
  pageNumber = 1,
  selectedFolder?: FileBrowserFolder,
) => {
  const queryKey = [
    "library_folders",
    computedPath,
    pageNumber,
    selectedFolder?.data.id,
  ];

  // Get the query client so we can access previous data
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKey,
    queryFn: () => {
      // Get the previous data for the current path (regardless of page number)
      const baseQueryKey = ["library_folders", computedPath];

      // Try to find the most recent data for this path by checking previous pages
      let previousData: FolderHookData | undefined;
      if (pageNumber > 1) {
        // Look for data from the previous page first
        previousData = queryClient.getQueryData<FolderHookData>([
          ...baseQueryKey,
          pageNumber - 1,
          selectedFolder?.data.id,
        ]);

        // If no data from previous page, try the current page (might have partial data)
        if (!previousData) {
          previousData = queryClient.getQueryData<FolderHookData>(queryKey);
        }
      }

      return fetchFolders(
        computedPath,
        pageNumber,
        previousData,
        selectedFolder,
      );
    },
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });
};

export default useFolders;
