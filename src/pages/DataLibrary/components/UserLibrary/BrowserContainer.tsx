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
  setRoot,
} from "./context/actions";

const BrowserContainer = ({
  type,
  path,
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
  } = state;

  const files = filesState[type];
  const folders = foldersState[type];
  const computedPath = initialPath[type];

  React.useEffect(() => {
    async function fetchUploads() {
      const client = ChrisAPIClient.getClient();
      const uploads = await client.getFileBrowserPaths({
        path,
      });
      dispatch(setInitialPath(path, type));
      dispatch(setLoading(true));

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

        dispatch(setFolders(folders, type));
        dispatch(
          setPagination(path, {
            hasNext: uploads.hasNextPage,
            limit: 50,
            offset: 0,
          })
        );

        dispatch(setLoading(false));
      }
    }

    fetchUploads();
  }, [dispatch]);

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
    dispatch(setLoading(true));

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
      dispatch(setFolders(folders, type));
      dispatch(setFiles([], type));
      dispatch(setInitialPath(path, type));
      dispatch(setLoading(false));

      if (path === username) {
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

      dispatch({
        type: Types.SET_PAGINATION,
        payload: {
          path,
          limit: pagination.limit,
          offset: pagination.offset,
          hasNext: fileList.hasNextPage,
        },
      });

      if (fileList) {
        const newFiles = fileList.getItems();

        if (files && files.length > 0 && newFiles) {
          const sumFiles = [...files, ...newFiles];
          dispatch(setFiles(sumFiles, type));
        } else if (newFiles) {
          dispatch(setFiles(newFiles, type));
        }
        dispatch(setInitialPath(path, type));

        dispatch(setRoot(false, type));

        const currentFolderSplit = path.split("/");
        const currentFolder = currentFolderSplit[currentFolderSplit.length - 1];
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
  };

  const handlePagination = (path: string) => {
    const offset = (paginated[path].offset += paginated[path].limit);
    dispatch(
      setPagination(path, {
        offset,
        hasNext: paginated[path].hasNext,
        limit: paginated[path].limit,
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
          browserType="feeds"
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
          browserType="feeds"
          handleDownload={handleDownload}
        />
      )}
    </React.Fragment>
  );
};

export default React.memo(BrowserContainer);
