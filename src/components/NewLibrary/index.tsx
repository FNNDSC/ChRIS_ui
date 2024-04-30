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

const NewLibrary = () => {
  async function fetchFolders(computedPath: string, pageNumber: number) {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();

    const pagination = {
      limit: pageNumber * 20,
      offset: 0,
    };

    try {
      const folderList: FileBrowserFolderFileList =
        await client.getFileBrowserFolders({
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
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [cardLayout, setCardLayout] = useState(true);
  const [uploadFileModal, setUploadFileModal] = useState(false);
  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || "/";
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["folders", computedPath, pageNumber],
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  useEffect(() => {
    dispatch(
      setSidebarActive({
        activeItem: "lib",
      }),
    );
  }, [dispatch]);

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
      <LibraryProvider>
        <Search
          handleChange={() => {
            setCardLayout(!cardLayout);
          }}
<<<<<<< HEAD
          handleUploadModal={() => {
            setUploadFileModal(!uploadFileModal);
          }}
          checked={cardLayout}
        />
        <div style={{ margin: "1rem" }}>
          <div
=======
        >
          <MenuBar
            handleChange={() => {
              setCardLayout(!cardLayout);
            }}
            handleUploadModal={() => {
              setUploadFileModal(!uploadFileModal);
            }}
            checked={cardLayout}
          />
          <BreadcrumbContainer
            path={computedPath}
            handleFolderClick={handleBreadcrumbClick}
          />
        </div>

        {isError && <Alert type="error" description={error.message} />}
        {data?.filesPagination.totalCount === -1 &&
          data?.foldersPagination.totalCount === -1 &&
          data?.linksPagination.totalCount === -1 && (
            <EmptyStateComponent title="No data in this path" />
          )}
        {data && cardLayout ? (
          <Grid
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)
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
<<<<<<< HEAD
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
            <div
              ref={observerTarget}
              style={{
                height: "10px",
              }}
            />{" "}
          </Grid>
        ) : (
          <TreeBrowser />
        )}
      </div>
      <UploadContainer
        isOpenModal={uploadFileModal}
        handleFileModal={() => setUploadFileModal(!uploadFileModal)}
      />
>>>>>>> 3c50fa9a (refactor: fix merge conflicts)
    </WrapperConnect>
  );
};

export default NewLibrary;
