import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import ChrisAPIClient from "../../../api/chrisapiclient";

export default async (computedPath: string, pageNumber?: number) => {
  const client = ChrisAPIClient.getClient();

  const pagination = {
    limit: pageNumber ? pageNumber * 50 : 100,
    offset: 0,
  };

  const errorMessages: string[] = [];

  try {
    const folderList = await client.getFileBrowserFolders({
      path: computedPath,
    });

    const folders = folderList.getItems();
    let subFoldersMap: FileBrowserFolder[] = [];
    let linkFilesMap: FileBrowserFolderLinkFile[] = [];
    let filesMap: FileBrowserFolderFile[] = [];
    const initialPaginateValue = {
      totalCount: 0,
      hasNextPage: false,
    };
    let filesPagination = initialPaginateValue;
    let foldersPagination = initialPaginateValue;
    let linksPagination = initialPaginateValue;

    if (folders) {
      const folder = folders[0];

      if (folder) {
        // Fetch children, link files, and folder files with individual try-catch blocks
        try {
          const children = await folder.getChildren(pagination);
          subFoldersMap = children.getItems();
          foldersPagination = {
            totalCount: children.totalCount,
            hasNextPage: children.hasNextPage,
          };
        } catch (error) {
          console.error("Error fetching folder children:", error);
          errorMessages.push("Failed to fetch subfolders.");
        }

        try {
          const linkFiles = await folder.getLinkFiles(pagination);
          linkFilesMap = linkFiles.getItems();
          linksPagination = {
            totalCount: linkFiles.totalCount,
            hasNextPage: linkFiles.hasNextPage,
          };
        } catch (error) {
          console.error("Error fetching link files:", error);
          errorMessages.push("Failed to fetch link files.");
        }

        try {
          const folderFiles = await folder.getFiles(pagination);
          filesMap = folderFiles.getItems();
          filesPagination = {
            totalCount: folderFiles.totalCount,
            hasNextPage: folderFiles.hasNextPage,
          };
        } catch (error) {
          errorMessages.push("Failed to fetch files.");
        }
      }
    }

    return {
      subFoldersMap,
      linkFilesMap,
      filesMap,
      filesPagination,
      foldersPagination,
      linksPagination,
      folderList, // return folderList to enable creating new folders
      errorMessages, // return any error messages encountered
    };
  } catch (e) {
    errorMessages.push("Failed to load folder list.");
    return { errorMessages }; // return errors in case the request fails entirely
  }
};
