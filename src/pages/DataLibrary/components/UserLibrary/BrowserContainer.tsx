import React, { useContext } from "react";
import { Button, EmptyState, Title } from "@patternfly/react-core";
import { Spin } from "antd";
import BreadcrumbContainer from "./BreadcrumbContainer";
import { Browser } from "./Browser";
import { LibraryContext } from "./context";
import ChrisAPIClient from "../../../../api/chrisapiclient";
import {
  setCurrentPath,
  setCurrentPathSearch,
  setFolders,
  setFiles,
  setTogglePreview,
  setFolderDetails,
  setCurrentSearchFolder,
  setCurrentSearchFiles,
  backToSearchResults,
  setFetching,
} from "./context/actions";

interface BrowserContainerInterface {
  type: string;
  path: string;
  username?: string | null;
}

const BrowserContainer = ({
  type,
  path: rootPath,
}: BrowserContainerInterface) => {
  const { state, dispatch } = useContext(LibraryContext);

  const {
    foldersState,
    currentPath,
    filesState,
    folderDetails,
    previewAll,
    search,
    fetchingResources,
    columnLayout,
  } = state;

  const resourcesFetch = React.useCallback(
    async (path: string) => {
      dispatch(setFetching(true));

      try {
        const client = ChrisAPIClient.getClient();
        const uploads = await client.getFileBrowserPaths({
          path,
        });

        if (search[type] === true) {
          dispatch(setCurrentPathSearch(path, type));
        } else {
          dispatch(setCurrentPath(path, type));
        }

        const parsedUpload =
          uploads.data &&
          uploads.data[0].subfolders &&
          JSON.parse(uploads.data[0].subfolders);

        if (parsedUpload && parsedUpload.length > 0) {
          let folders;

          if (type === "feed" && path === "/") {
            folders = parsedUpload.filter(
              (folder: string) => folder !== "SERVICES"
            );
          } else if (type === "feed" && path !== "/") {
            folders = parsedUpload.filter(
              (folder: string) => folder !== "uploads"
            );
          } else {
            folders = parsedUpload;
          }

          folders = folders.map((folder: string) => ({
              name: folder,
              path: `${path}`,
            }));
          if (search[type] === true) {
            dispatch(setCurrentSearchFolder(folders, path, type));
          } else {
            dispatch(setFolders(folders, path, type));
          }
        }
      } catch (error) {
        console.log("ERROR", error);
      }
    },
    [dispatch, type, search]
  );

  React.useEffect(() => {
    async function fetchUploads() {
      resourcesFetch(rootPath);
    }

    if (!search[type] && !currentPath[type] && !foldersState[type]) {
      fetchUploads();
      dispatch(setFetching(false));
    }
  }, [
    rootPath,
    dispatch,
    resourcesFetch,
    search,
    type,
    currentPath,
    foldersState,
  ]);

  const handleFolderClick = async (path: string) => {
    const client = ChrisAPIClient.getClient();
    resourcesFetch(path);
    const pagination = {
      limit: 100,
      offset: 0,
      totalCount: 0,
    };

    if (path !== "/") {
      const pathList = await client.getFileBrowserPath(path);
      if (pathList) {
        const fileList = await pathList.getFiles({
          limit: pagination.limit,
          offset: pagination.offset,
        });

        if (fileList) {
          const files = fileList.getItems();
          if (files && files.length > 0) {
            if (search[type]) {
              dispatch(setCurrentSearchFiles(files, path, type));
            } else {
              dispatch(setFiles(files, path, type));
            }

            const currentFolderSplit = path.split("/");
            const currentFolder =
              currentFolderSplit[currentFolderSplit.length - 1];
            const {totalCount} = fileList;
            dispatch(setFolderDetails(totalCount, currentFolder));
          }
        }
      }
    }

    dispatch(setFetching(false));
  };

  const togglePreview = () => {
    dispatch(setTogglePreview(!previewAll));
  };

  const path = currentPath[type];
  const folders = foldersState[type] && foldersState[type][path];
  const files = filesState[type] && filesState[type][path];
  const noData =
    (path && !folders && !files && !fetchingResources) ||
    (folders && folders.length === 0);

  return (
    <>
      {search[type] === true ? (
        <div>
          <SearchContainer
            togglePreview={togglePreview}
            handleFolderClick={handleFolderClick}
            type={type}
          />
        </div>
      ) : (
        <>
          {currentPath[type] && foldersState[type] ? (
            <div>
              <BreadcrumbContainer
                browserType={type}
                handleFolderClick={handleFolderClick}
                path={path}
                files={files}
                folderDetails={folderDetails}
                previewAll={previewAll}
                togglePreview={togglePreview}
              />
              {fetchingResources ? (
                <div className="spin-container">
                  <Spin size="large" spinning />
                </div>
              ) : (
                <Browser
                  handleFolderClick={handleFolderClick}
                  folders={folders}
                  files={files}
                  browserType={type}
                  columnLayout={columnLayout}
                />
              )}
            </div>
          ) : !noData ? (
            <div className="spin-container">
              <Spin size="large" spinning />
            </div>
          ) : null}
          {noData && (
            <EmptyState>
              <Title headingLevel="h4" size="lg">
                No Data Found for the path {path}
              </Title>
            </EmptyState>
          )}
        </>
      )}
    </>
  );
};

export default React.memo(BrowserContainer);

export const SearchContainer = ({
  type,
  handleFolderClick,
  togglePreview,
}: {
  type: string;
  handleFolderClick: (path: string) => void;
  togglePreview: () => void;
}) => {
  const { state, dispatch } = useContext(LibraryContext);
  const {
    searchedFoldersState,
    currentSearchFiles,
    currentSearchFolders,
    folderDetails,
    previewAll,
    searchPath,
    emptySetIndicator,
    columnLayout,
  } = state;

  const resources = searchedFoldersState[type];
  const currentPath = searchPath[type];
  const searchFolders =
    currentSearchFolders[type] && currentSearchFolders[type][currentPath];
  const files =
    currentSearchFiles[type] && currentSearchFiles[type][currentPath];

  return (
    <>
      {searchPath[type] ? (
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: "1em" }}
        >
          <div>
            <Button
              variant="tertiary"
              onClick={() => {
                dispatch(backToSearchResults(type));
              }}
            >
              <b>Back to Search Results</b>
            </Button>
          </div>

          <BreadcrumbContainer
            path={currentPath}
            handleFolderClick={handleFolderClick}
            browserType={type}
            files={files}
            folderDetails={folderDetails}
            previewAll={previewAll}
            togglePreview={togglePreview}
          />
          <Browser
            handleFolderClick={handleFolderClick}
            folders={searchFolders}
            files={files}
            browserType={type}
            columnLayout={columnLayout}
          />
        </div>
      ) : (
        resources.map((resource, index) => {
          const path = Object.getOwnPropertyNames(resource)[0];
          const folders = resource[path];

          return (
            <div key={index}>
              <BreadcrumbContainer
                path={path}
                handleFolderClick={handleFolderClick}
                browserType={type}
                files={[]}
                folderDetails={folderDetails}
                previewAll={previewAll}
                togglePreview={togglePreview}
              />
              <Browser
                handleFolderClick={handleFolderClick}
                folders={folders}
                files={[]}
                browserType={type}
                columnLayout={columnLayout}
              />
            </div>
          );
        })
      )}
      {emptySetIndicator[type] && (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            {emptySetIndicator[type]}
          </Title>
        </EmptyState>
      )}
    </>
  );
};
