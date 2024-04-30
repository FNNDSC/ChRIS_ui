<<<<<<< HEAD
import {
  FileBrowserFolderFile,
  FileBrowserFolder,
  FileBrowserFolderFileList,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Grid } from "@patternfly/react-core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ChrisAPIClient from "../../api/chrisapiclient";
import { setSidebarActive } from "../../store/ui/actions";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { LibraryProvider } from "../LibraryCopy/context";
import WrapperConnect from "../Wrapper";
import BreadcrumbContainer from "./Breadcrumb";
import { FilesCard, FolderCard, LinkCard } from "./Browser";
import Search from "./Search";
import TreeBrowser from "./TreeBrowser";
import UploadContainer from "./UploadComponent";
=======
import { Grid, Button } from "@patternfly/react-core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { debounce } from "lodash";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChrisAPIClient from "../../api/chrisapiclient";
import { EmptyStateComponent, SpinContainer } from "../Common";
import WrapperConnect from "../Wrapper";
import BreadcrumbContainer from "./Breadcrumb";
import { FilesCard, FolderCard, LinkCard } from "./Browser";
>>>>>>> 8412135d (feat: A mvp for the library page)

const NewLibrary = () => {
  async function fetchFolders(computedPath: string, pageNumber: number) {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();

    const pagination = {
      limit: pageNumber * 20,
      offset: 0,
    };

    try {
<<<<<<< HEAD
      const folderList: FileBrowserFolderFileList =
        await client.getFileBrowserFolders({
          path: computedPath,
        });

      const folders = folderList.getItems();
      let subFoldersMap: FileBrowserFolder[] = [];
      let linkFilesMap: FileBrowserFolderLinkFile[] = [];
      let filesMap: FileBrowserFolderFile[] = [];
=======
      const folderList = await client.getFileBrowserFolders({
        path: computedPath,
      });

      const folders = folderList.getItems();
      const subFoldersMap = new Map();
      const linkFilesMap = new Map();
      const filesMap = new Map();
>>>>>>> 8412135d (feat: A mvp for the library page)
      const initialPaginateValue = {
        totalCount: 0,
        hasNextPage: false,
      };
      let filesPagination = initialPaginateValue;
      let foldersPagination = initialPaginateValue;
      let linksPagination = initialPaginateValue;

      if (folders) {
<<<<<<< HEAD
        const folder = folders[0];

        if (folder) {
          const children = await folder.getChildren(pagination);
          const linkFiles = await folder.getLinkFiles(pagination);
          const folderFiles = await folder.getFiles(pagination);

          subFoldersMap = children.getItems();
          filesMap = folderFiles.getItems();
          linkFilesMap = linkFiles.getItems();

          foldersPagination = {
            totalCount: children.totalCount,
            hasNextPage: children.hasNextPage,
          };
          linksPagination = {
            totalCount: linkFiles.totalCount,
            hasNextPage: linkFiles.hasNextPage,
          };
          filesPagination = {
            totalCount: folderFiles.totalCount,
            hasNextPage: folderFiles.hasNextPage,
          };
=======
        for (const folder of folders) {
          try {
            const children = await folder.getChildren(pagination);
            const linkFiles = await folder.getLinkFiles(pagination);
            const folderFiles = await folder.getFiles(pagination);

            foldersPagination = {
              totalCount: children.totalCount,
              hasNextPage: children.hasNextPage,
            };
            linksPagination = {
              totalCount: linkFiles.totalCount,
              hasNextPage: linkFiles.hasNextPage,
            };
            filesPagination = {
              totalCount: folderFiles.totalCount,
              hasNextPage: folderFiles.hasNextPage,
            };

            subFoldersMap.set(folder.data.id, children.getItems());
            linkFilesMap.set(folder.data.id, linkFiles.getItems());
            filesMap.set(folder.data.id, folderFiles.getItems());
          } catch (error) {
            // biome-ignore lint/complexity/noUselessCatch: <explanation>
            throw error;
          }
>>>>>>> 8412135d (feat: A mvp for the library page)
        }
      }

      return {
        subFoldersMap,
        linkFilesMap,
        filesMap,
        filesPagination,
        foldersPagination,
        linksPagination,
      };
    } catch (error) {
      throw error;
    }
  }

  const { pathname } = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [cardLayout, setCardLayout] = useState(true);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || "/";
=======
  const [pageNumber, setPageNumber] = useState(1);

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];

  const computedPath = currentPathSplit || "/";

>>>>>>> 8412135d (feat: A mvp for the library page)
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["folders", computedPath, pageNumber],
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

<<<<<<< HEAD
  useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "lib",
      }),
    );
  }, [dispatch]);

=======
>>>>>>> 8412135d (feat: A mvp for the library page)
  const handleFolderClick = debounce((folder: string) => {
    const url = `${decodedPath}/${folder}`;
    navigate(url);
  }, 500);

  const handleBreadcrumbClick = (path: string) => {
    navigate(`/library${path}`);
  };

  const handlePagination = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const observerTarget = useRef(null);

  const fetchMore =
    data?.foldersPagination.hasNextPage ||
    data?.filesPagination.hasNextPage ||
    data?.linksPagination.hasNextPage;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
<<<<<<< HEAD
=======
        console.log("Scrolling", fetchMore, entries[0].isIntersecting);
>>>>>>> 8412135d (feat: A mvp for the library page)
        if (entries[0].isIntersecting && fetchMore) {
          handlePagination();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchMore]);

  return (
    <WrapperConnect>
<<<<<<< HEAD
      <LibraryProvider>
        <Search
          handleChange={() => {
            setCardLayout(!cardLayout);
          }}
          handleUploadModal={() => {
            setUploadFileModal(!uploadFileModal);
          }}
          checked={cardLayout}
        />
        <div style={{ margin: "1rem" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {cardLayout && (
              <BreadcrumbContainer
                path={computedPath}
                handleFolderClick={handleBreadcrumbClick}
              />
            )}
          </div>

          {isError && <Alert type="error" description={error.message} />}
          {data?.filesPagination.totalCount === -1 &&
            data?.foldersPagination.totalCount === -1 &&
            data?.linksPagination.totalCount === -1 && (
              <EmptyStateComponent title="No data in this path" />
            )}
          {data &&
            (cardLayout ? (
              <Grid
                style={{
                  marginTop: "1rem",
                }}
                hasGutter={true}
              >
                <FolderCard
                  folders={data.subFoldersMap}
                  handleFolderClick={handleFolderClick}
                  computedPath={computedPath}
                  pagination={data.foldersPagination}
                />
                <FilesCard
                  files={data.filesMap}
                  pagination={data.filesPagination}
                />
                <LinkCard
                  linkFiles={data.linkFilesMap}
                  pagination={data.linksPagination}
                />
                {(isPending || isFetching) && (
                  <SpinContainer title="Fetching more data..." />
                )}
                {fetchMore && !(isPending || isFetching) && (
                  <>
                    <Button onClick={handlePagination} variant="link">
                      Load More Data...
                    </Button>
                  </>
                )}
                <div
                  ref={observerTarget}
                  style={{
                    height: "10px",
                  }}
                />{" "}
              </Grid>
            ) : (
              <TreeBrowser />
            ))}
        </div>
        <UploadContainer
          isOpenModal={uploadFileModal}
          handleFileModal={() => setUploadFileModal(!uploadFileModal)}
        />
      </LibraryProvider>
=======
      <div style={{ margin: "1rem" }}>
        <BreadcrumbContainer
          path={computedPath}
          handleFolderClick={handleBreadcrumbClick}
        />

        {isError && <Alert type="error" description={error.message} />}
        {data?.filesPagination.totalCount === -1 &&
          data?.foldersPagination.totalCount === -1 &&
          data?.linksPagination.totalCount === -1 && (
            <EmptyStateComponent title="No data in this path" />
          )}
        {data && (
          <Grid
            style={{
              marginTop: "1rem",
            }}
            hasGutter={true}
          >
            <FolderCard
              folders={data.subFoldersMap}
              handleFolderClick={handleFolderClick}
              computedPath={computedPath}
              pagination={data.foldersPagination}
            />
            <FilesCard
              files={data.filesMap}
              pagination={data.filesPagination}
            />
            <LinkCard
              linkFiles={data.linkFilesMap}
              pagination={data.linksPagination}
            />
            {(isPending || isFetching) && (
              <SpinContainer title="Fetching more data..." />
            )}
            {fetchMore && !(isPending || isFetching) && (
              <>
                <Button onClick={handlePagination} variant="link">
                  Load More Data...
                </Button>
              </>
            )}
            <div
              ref={observerTarget}
              style={{
                height: "10px",
              }}
            />{" "}
          </Grid>
        )}
      </div>
>>>>>>> 8412135d (feat: A mvp for the library page)
    </WrapperConnect>
  );
};

export default NewLibrary;
