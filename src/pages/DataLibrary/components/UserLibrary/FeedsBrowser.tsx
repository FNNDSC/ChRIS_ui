import React, { useContext } from "react";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import SpinAlert from "./Spin";
import { LibraryContext, Types } from "./context";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";

const FeedsBrowser = () => {
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
  const username = useTypedSelector((state) => state.user.username);

  const files = filesState["feed"];
  const folders = foldersState["feed"];
  const computedPath = initialPath["feed"];

  React.useEffect(() => {
    async function fetchUploads() {
      if (username) {
        const client = ChrisAPIClient.getClient();
        const path = `${username}`;
        const uploads = await client.getFileBrowserPaths({
          path,
        });
        dispatch({
          type: Types.SET_INITIAL_PATH,
          payload: {
            path,
            type: "feed",
          },
        });
        dispatch({
          type: Types.SET_LOADING,
          payload: {
            loading: true,
          },
        });
        if (
          uploads.data &&
          uploads.data[0].subfolders &&
          uploads.data[0].subfolders.length > 0
        ) {
          const folders = uploads.data[0].subfolders.split(",");
          const feedFolders = folders.filter(
            (feed: string) => feed !== "uploads"
          );
          dispatch({
            type: Types.SET_FOLDERS,
            payload: {
              folders: feedFolders,
              type: "feed",
            },
          });
          dispatch({
            type: Types.SET_PAGINATION,
            payload: {
              path,
              hasNext: uploads.hasNextPage,
              limit: 50,
              offset: 0,
            },
          });

          dispatch({
            type: Types.SET_LOADING,
            payload: {
              loading: false,
            },
          });
        }
      }
    }

    fetchUploads();
  }, []);

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
    dispatch({
      type: Types.SET_LOADING,
      payload: {
        loading: true,
      },
    });

    const uploads = await client.getFileBrowserPaths({
      path,
      ...pagination,
    });

    if (
      uploads.data &&
      uploads.data[0].subfolders &&
      uploads.data[0].subfolders.length > 0
    ) {
      const folders = uploads.data[0].subfolders.split(",");
      const feedFolders = folders.filter((feed: string) => feed !== "uploads");
      dispatch({
        type: Types.SET_FOLDERS,
        payload: {
          folders: feedFolders,
          type: "feed",
        },
      });
      dispatch({
        type: Types.SET_FILES,
        payload: {
          files: [],
          type: "feed",
        },
      });
      dispatch({
        type: Types.SET_INITIAL_PATH,
        payload: {
          path,
          type: "feed",
        },
      });
      dispatch({
        type: Types.SET_LOADING,
        payload: {
          loading: false,
        },
      });
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
          dispatch({
            type: Types.SET_FILES,
            payload: {
              files: sumFiles,
              type: "feed",
            },
          });
        } else {
          dispatch({
            type: Types.SET_FILES,
            payload: {
              files: newFiles,
              type: "feed",
            },
          });
        }
        dispatch({
          type: Types.SET_INITIAL_PATH,
          payload: {
            path,
            type: "feed",
          },
        });

        dispatch({
          type: Types.SET_FOLDERS,
          payload: {
            folders: [],
            type: "feed",
          },
        });

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
      dispatch({
        type: Types.SET_LOADING,
        payload: {
          loading: false,
        },
      });
    }
  };

  const handlePagination = (path: string) => {
    const offset = (paginated[path].offset += paginated[path].limit);
    dispatch({
      type: Types.SET_PAGINATION,
      payload: {
        path,
        offset,
        hasNext: paginated[path].hasNext,
        limit: paginated[path].limit,
      },
    });
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

export default FeedsBrowser;
