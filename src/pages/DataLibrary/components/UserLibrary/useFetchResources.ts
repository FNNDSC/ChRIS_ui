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
  const [paginated, setPaginated] = React.useState<{
    [key: string]: Paginated;
  }>({});
  const [initialPath, setInitialPath] = React.useState("");
  const [previewAll, setPreviewAll] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchUploads() {
      if (username) {
        const client = ChrisAPIClient.getClient();
        let uploads;
        let path;
        setLoading(true);
        if (browserType === "feed") {
          path = `${username}`;
          uploads = await client.getFileBrowserPaths({
            path,
          });
          setInitialPath(`${path}`);
        } else {
          path = `${username}/uploads`;
          uploads = await client.getFileBrowserPaths({
            path,
          });
          setInitialPath(`${path}`);
        }

        if (
          uploads.data &&
          uploads.data[0].subfolders &&
          uploads.data[0].subfolders.length > 0
        ) {
          const folders = uploads.data[0].subfolders.split(",");
          setPaginated({
            ...paginated,
            [path]: {
              hasNext: uploads.hasNextPage,
              limit: 50,
              offset: 0,
            },
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
        setLoading(false);
      }
    }

    fetchUploads();
  }, []);

  const togglePreview = () => {
    setPreviewAll(!previewAll);
  };

  const handleFolderClick = async (path: string, breadcrumb?: any) => {
    const client = ChrisAPIClient.getClient();
    const pagination = breadcrumb
      ? breadcrumb
      : paginated[path]
      ? paginated[path]
      : {
          hasNext: false,
          limit: 50,
          offset: 0,
        };
    setLoading(true);

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
        [path]: {
          ...paginated[path],
          limit: pagination.limit,
          offset: pagination.offset,
          hasNext: uploads.hasNextPage,
        },
      });
      setInitialPath(path);
    } else {
      const pathList = await client.getFileBrowserPath(path);
      const fileList = await pathList.getFiles({
        limit: pagination.limit,
        offset: pagination.offset,
      });

      setPaginated({
        ...paginated,
        [path]: {
          ...paginated[path],
          limit: pagination.limit,
          offset: pagination.offset,
          hasNext: fileList.hasNextPage,
        },
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
    setLoading(false);
  };

  const handlePagination = (path: string) => {
    const offset = (paginated[path].offset += paginated[path].limit);
    setPaginated({
      ...paginated,
      [path]: {
        ...paginated[path],
        offset,
      },
    });
    handleFolderClick(path);
  };

  const handleAddFolder = (folderName: string) => {
    const newFolders = [...folders, folderName];
    setSubFolders(newFolders);
  };

  const handleDelete = async (path: string, folderName: string) => {
    const client = ChrisAPIClient.getClient();
    const paths = await client.getFileBrowserPath(path);
    const fileList = await paths.getFiles({
      limit: 1000,
      offset: 0,
    });
    const files = fileList.getItems();
    if (files) {
      files.map(async (file: any) => {
        await file._delete();
      });
    }
    const newFolders = folders.filter((folder) => folder !== folderName);
    setSubFolders(newFolders);
  };

  const resetPaginated = (path: string) => {
    setPaginated({
      ...paginated,
      [path]: {
        hasNext: false,
        limit: 50,
        offset: 0,
      },
    });
  };
  return {
    initialPath,
    files,
    folders,
    paginated,
    handlePagination,
    loading,
    handleFolderClick,
    folderDetails,
    resetPaginated,
    togglePreview,
    previewAll,
    handleDelete,
    handleAddFolder,
  };
};

export default useFetchResources;
