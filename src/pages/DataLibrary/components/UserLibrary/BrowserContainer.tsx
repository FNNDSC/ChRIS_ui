import React, { useContext } from "react";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import SpinAlert from "./Spin";
import { LibraryContext, Types } from "./context";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import {
  setInitialPath,
  setLoading,
  setFolders,
  setFiles,
  setPagination,
  setPaginatedFolders,
  setRoot,
} from "./context/actions";

const BrowserContainer = ({
  type,
  path: rootPath,
  username,
}: {
  type: string;
  path: string;
  username?: string | null;
}) => {
  const { state, dispatch } = useContext(LibraryContext);
  const {
    filesState,
    foldersState,
    initialPath,
    folderDetails,
    previewAll,
    loading,
    paginated,
    paginatedFolders,
  } = state;
  
  const files = filesState[type];
  const computedPath = initialPath[type];
  const folders = paginatedFolders[computedPath] || foldersState[computedPath];


  React.useEffect(() => {
    async function fetchUploads() {
      const client = ChrisAPIClient.getClient();
      const uploads = await client.getFileBrowserPaths({
        path: rootPath,
      });
      dispatch(setInitialPath(rootPath, type));
      dispatch(setLoading(true));
      const limit = 30;

      if (
        uploads.data &&
        uploads.data[0].subfolders &&
        uploads.data[0].subfolders.length > 0
      ) {
        let folders;
        const folderSplit = uploads.data[0].subfolders.split(",");

        if (type === "feed") {
          folders = folderSplit.filter((feed: string) => feed !== "uploads");
        } else {
          folders = folderSplit;
        }

        dispatch(setFolders(folders, rootPath));
        if (folders.length > 30) {
          const limit = 30;
          const folderPaginate = folders.slice(0, limit);
          dispatch(setPaginatedFolders(folderPaginate, rootPath));
        } else {
          dispatch(setPaginatedFolders(folders, rootPath));
        }
        dispatch(
          setPagination(rootPath, {
            hasNext: folders.length > 30,
            limit,
            offset: 0,
            totalCount: folders.length,
          })
        );

        dispatch(setLoading(false));
      }
    }

    fetchUploads();
  }, [dispatch, rootPath, type]);

  const handleFolderClick = async (path: string, breadcrumb?: any) => {
    const client = ChrisAPIClient.getClient();
    const pagination = breadcrumb
      ? breadcrumb
      : paginated[path]
      ? paginated[path]
      : {
          hasNext: false,
          limit: 30,
          offset: 0,
          totalCount: 0,
        };
    dispatch(setLoading(true));

    if (paginatedFolders[path] && foldersState[path].length > 30) {
      const folders = foldersState[path];
      const newFolders = folders.slice(
        pagination.offset,
        pagination.limit + pagination.offset
      );
      const totalFolders = [...newFolders, ...paginatedFolders[path]];
      dispatch(setPaginatedFolders(totalFolders, path));
      dispatch(setLoading(false));
      dispatch(setFiles([], type));
      dispatch(setInitialPath(path, type));
      if (path !== rootPath) {
        dispatch(setRoot(true, type));
      } else {
        dispatch(setRoot(false, type));
      }
    } else {
      const uploads = await client.getFileBrowserPaths({
        path,
        ...pagination,
      });

      if (
        uploads.data &&
        uploads.data[0].subfolders &&
        uploads.data[0].subfolders.length > 0
      ) {
        let folders;
        const folderSplit = uploads.data[0].subfolders.split(",");
        if (type === "feed") {
          folders = folderSplit.filter((feed: string) => feed !== "uploads");
        } else {
          folders = folderSplit;
        }
        dispatch(setFolders(folders, path));
        if (folders.length > 30) {
          const limit = 30;
          const folderPaginate = folders.slice(0, limit);
          dispatch(setPaginatedFolders(folderPaginate, path));
        } else {
          dispatch(setPaginatedFolders(folders, path));
        }
        dispatch(setFiles([], type));
        dispatch(setInitialPath(path, type));
        dispatch(setLoading(false));

        if (path !== rootPath) {
          dispatch(setRoot(true, type));
        } else {
          dispatch(setRoot(false, type));
        }
      } else {
        const pathList = await client.getFileBrowserPath(path);
        const fileList = await pathList.getFiles({
          limit: pagination.limit,
          offset: pagination.offset,
        });

        dispatch(
          setPagination(path, {
            limit: pagination.limit,
            offset: pagination.offset,
            hasNext: fileList.hasNextPage,
            totalCount: fileList.totalCount,
          })
        );

        if (fileList) {
          const newFiles = fileList.getItems();

          if (files && files.length > 0 && newFiles) {
            const sumFiles = [...files, ...newFiles];
            dispatch(setFiles(sumFiles, type));
          } else if (newFiles) {
            dispatch(setFiles(newFiles, type));
          }
          dispatch(setInitialPath(path, type));
          dispatch(setRoot(true, type));
          const currentFolderSplit = path.split("/");
          const currentFolder =
            currentFolderSplit[currentFolderSplit.length - 1];
          const totalCount = fileList.totalCount;
          dispatch({
            type: Types.SET_FOLDER_DETAILS,
            payload: {
              totalCount,
              currentFolder,
            },
          });
        }
        dispatch(setLoading(false));
      }
    }
  };

  const handlePagination = (path: string) => {
    const offset = (paginated[path].offset += paginated[path].limit);
    dispatch(
      setPagination(path, {
        offset,
        hasNext: paginated[path].hasNext,
        limit: paginated[path].limit,
        totalCount: paginated[path].totalCount,
      })
    );
    handleFolderClick(path);
  };

  const togglePreview = () => {
    dispatch({
      type: Types.SET_PREVIEW_ALL,
      payload: {
        previewAll: !previewAll,
      },
    });
  };

  const handleDownload = async (path: string, folderName: string) => {
    const client = ChrisAPIClient.getClient();
    const paths = await client.getFileBrowserPath(path);

    const fileList = await paths.getFiles({
      limit: 1000,
      offset: 0,
    });
    const files = fileList.getItems();
    //@ts-ignore
    const existingDirectoryHandle = await window.showDirectoryPicker();
    const newDirectoryHandle = await existingDirectoryHandle.getDirectoryHandle(
      folderName,
      {
        create: true,
      }
    );

    if (files) {
      let writable;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await file.getFileBlob();
        const paths = file.data.fname.split("/");
        const fileName = paths[paths.length - 1];
        const newFileHandle = await newDirectoryHandle.getFileHandle(fileName, {
          create: true,
        });
        writable = await newFileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        // Close the file and write the contents to disk.
      }
    }
  };

  return (
    <React.Fragment>
      {
        <BreadcrumbContainer
          initialPath={computedPath}
          handleFolderClick={handleFolderClick}
          files={files}
          folderDetails={folderDetails}
          browserType={type}
          togglePreview={togglePreview}
          previewAll={previewAll}
        />
      }

      {loading ? (
        <SpinAlert browserType="feeds" />
      ) : (
        <Browser
          initialPath={computedPath}
          files={files}
          folders={folders}
          handleFolderClick={handleFolderClick}
          paginated={paginated}
          handlePagination={handlePagination}
          previewAll={previewAll}
          browserType={type}
          handleDownload={handleDownload}
          username={username}
        />
      )}
    </React.Fragment>
  );
};

export default React.memo(BrowserContainer);
