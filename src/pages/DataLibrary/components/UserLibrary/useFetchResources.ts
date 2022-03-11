import React, { useState } from "react";
import { useTypedSelector } from "../../../../store/hooks";
import { Paginated } from ".";
import ChrisAPIClient from "../../../../api/chrisapiclient";

const useFetchResources = (browserType: string) => {
  const username = useTypedSelector((state) => state.user.username);
  const [folders, setSubFolders] = React.useState<string[]>([]);
  const [files, setFiles] = React.useState<any[]>([]);
  const [folderDetails, setFolderDetails] = React.useState<{
    currentFolder: string;
    totalCount: number;
  }>({
    currentFolder: "",
    totalCount: 0,
  });
  const [paginated, setPaginated] = React.useState<Paginated>({
    hasNext: false,
    limit: 50,
    offset: 0,
  });
  const [initialPath, setInitialPath] = React.useState("");

  React.useEffect(() => {
    async function fetchUploads() {
      if (username) {
        const client = ChrisAPIClient.getClient();
        let uploads;
        if (browserType === "feed") {
          uploads = await client.getFileBrowserPaths({
            path: `${username}`,
          });
          setInitialPath(`${username}`);
        } else {
          uploads = await client.getFileBrowserPaths({
            path: `${username}/uploads`,
          });
          setInitialPath(`${username}/uploads`);
        }

        if (
          uploads.data &&
          uploads.data[0].subfolders &&
          uploads.data[0].subfolders.length > 0
        ) {
          const folders = uploads.data[0].subfolders.split(",");
          setPaginated({
            ...paginated,
            hasNext: uploads.hasNextPage,
          });
          if (browserType === "feed") {
            const feedFolders = folders.filter(
              (folder: any) => folder !== "uploads"
            );
            setSubFolders(feedFolders);
          } else {
            setSubFolders(folders);
          }
        }
      }
    }

    fetchUploads();
  }, []);

  const handleFolderClick = async (path: string, breadcrumb?: any) => {
    const client = ChrisAPIClient.getClient();
    const pagination = breadcrumb ? breadcrumb : paginated;
    const uploads = await client.getFileBrowserPaths({
      path: path,
      ...pagination,
    });

    if (
      uploads.data &&
      uploads.data[0].subfolders &&
      uploads.data[0].subfolders.length > 0
    ) {
      const folders = uploads.data[0].subfolders.split(",");
      if (browserType === "feed") {
        const feedFolders = folders.filter(
          (folder: any) => folder !== "uploads"
        );
        setSubFolders(feedFolders);
      } else {
        setSubFolders(folders);
      }
      setFiles([]);
      setPaginated({
        ...paginated,
        hasNext: uploads.hasNextPage,
      });
      setInitialPath(path);
    } else {
      const pathList = await client.getFileBrowserPath(path);
      const fileList = await pathList.getFiles({
        limit: paginated.limit,
        offset: paginated.offset,
      });

      setPaginated({
        ...paginated,
        hasNext: fileList.hasNextPage,
      });

      if (fileList) {
        const newFiles = fileList.getItems();
        if (files.length > 0 && newFiles) {
          setFiles([...files, ...newFiles]);
        } else if (newFiles) {
          setFiles(newFiles);
        }
        setInitialPath(path);
        setSubFolders([]);
        const currentFolderSplit = path.split("/");
        const currentFolder = currentFolderSplit[currentFolderSplit.length - 1];
        const totalCount = fileList.totalCount;
        setFolderDetails({
          currentFolder,
          totalCount,
        });
      }
    }
  };

  const handlePagination = (path: string) => {
    const offset = (paginated.offset += paginated.limit);
    setPaginated({
      ...paginated,
      offset,
    });
    handleFolderClick(path);
  };

  return {
    initialPath,
    files,
    folders,
    paginated,
    handlePagination,
    handleFolderClick,
    folderDetails,
  };
};

export default useFetchResources;
