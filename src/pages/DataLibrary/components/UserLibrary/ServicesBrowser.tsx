import React, { useContext } from "react";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import SpinAlert from "./Spin";
import { LibraryContext, Types } from "./context";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import { useTypedSelector } from "../../../../store/hooks";

const ServicesBrowser = () => {
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
  const files = filesState["services"];
  const folders = foldersState["services"];
  const computedPath = initialPath["services"];

  React.useEffect(() => {
    async function fetchUploads() {
      if (username) {
        const client = ChrisAPIClient.getClient();
        const path = `SERVICES`;
        const uploads = await client.getFileBrowserPaths({
          path,
        });
        dispatch({
          type: Types.SET_INITIAL_PATH,
          payload: {
            path,
            type: "services",
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

          dispatch({
            type: Types.SET_FOLDERS,
            payload: {
              folders,
              type: "services",
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
          type: "services",
        },
      });
      dispatch({
        type: Types.SET_FILES,
        payload: {
          files: [],
          type: "services",
        },
      });
      dispatch({
        type: Types.SET_INITIAL_PATH,
        payload: {
          path,
          type: "services",
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
              type: "services",
            },
          });
        } else {
          dispatch({
            type: Types.SET_FILES,
            payload: {
              files: newFiles,
              type: "services",
            },
          });
        }
        dispatch({
          type: Types.SET_INITIAL_PATH,
          payload: {
            path,
            type: "services",
          },
        });

        dispatch({
          type: Types.SET_FOLDERS,
          payload: {
            folders: [],
            type: "services",
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

  const togglePreview = () => {
    dispatch({
      type: Types.SET_PREVIEW_ALL,
      payload: {
        previewAll: !previewAll,
      },
    });
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
        <SpinAlert browserType="services" />
      ) : (
        <Browser
          initialPath={computedPath}
          files={files}
          folders={folders}
          handleFolderClick={handleFolderClick}
          paginated={paginated}
          handlePagination={handlePagination}
          previewAll={previewAll}
          browserType="services"
        />
      )}
    </React.Fragment>
  );
};

export default ServicesBrowser;
