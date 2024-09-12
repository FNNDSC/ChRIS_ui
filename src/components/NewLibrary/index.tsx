import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Grid, PageSection } from "@patternfly/react-core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { EmptyStateComponent, SpinContainer } from "../Common";
import WrapperConnect from "../Wrapper";
import BreadcrumbContainer from "./components/BreadcrumbContainer";
import { FilesCard, LinkCard } from "./components/FileCard";
import { FolderCard } from "./components/FolderCard";
import LibraryTable from "./components/LibraryTable";
import Operations from "./components/Operations";
import { OperationContext } from "./context";

// Fetch folders from the server
export async function fetchFolders(computedPath: string, pageNumber?: number) {
  const client = ChrisAPIClient.getClient();
  await client.setUrls();
  const pagination = {
    limit: pageNumber ? pageNumber * 50 : 100,
    offset: 0,
  };

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
      folderList, // return folderList as you can make a post request to this resource to create a new folder
    };
  } catch (e) {
    // biome-ignore lint/complexity/noUselessCatch: <explanation>
    throw e;
  }
}

const NewLibrary = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const username = useTypedSelector((state) => state.user.username);
  const currentLayout = useTypedSelector((state) => state.cart.currentLayout);
  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || "/";
  const queryKey = ["library_folders", computedPath, pageNumber];
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  // Redirect to /library/home/username if the pathname is /library and  this is the first load of the page
  useEffect(() => {
    if (isFirstLoad && pathname === "/library") {
      navigate(`/library/home/${username}`, { replace: true });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, pathname, username, navigate]);

  const fetchMore =
    data?.foldersPagination.hasNextPage ||
    data?.filesPagination.hasNextPage ||
    data?.linksPagination.hasNextPage;

  // Set up an intersection observer to load more data when the user scrolls to the bottom of the page
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

  // Debounce the folder click event to avoid multiple clicks
  const handleFolderClick = debounce((folder: string) => {
    const url = `${decodedPath}/${folder}`;
    navigate(url);
  }, 500);

  // Handle pagination by incrementing the page number
  const handlePagination = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const observerTarget = useRef(null);

  // Prevent initial render if redirecting
  if (isFirstLoad && pathname === "/library") {
    return null;
  }

  return (
    <WrapperConnect>
      <PageSection
        style={{
          paddingBlockStart: "0",
        }}
      >
        <Operations
          origin={{
            type: OperationContext.LIBRARY,
            additionalKeys: [computedPath],
          }}
          computedPath={computedPath}
          folderList={data?.folderList}
          customStyle={{ toolbarItem: { paddingInlineStart: "0" } }}
        />

        <BreadcrumbContainer
          path={computedPath}
          handleFolderClick={(path: string) => {
            navigate(path);
          }}
          username={username as string}
        />
      </PageSection>

      <PageSection style={{ paddingBlockStart: "0" }}>
        {isLoading && <SpinContainer title="Fetching Resources..." />}
        {isError && <Alert type="error" description={error.message} />}

        {/* Render based on currentLayout */}
        {currentLayout === "list" ? (
          <>
            {data &&
            data.subFoldersMap.length === 0 &&
            data.linkFilesMap.length === 0 &&
            data.filesMap.length === 0 ? (
              <EmptyStateComponent title="This folder is empty" />
            ) : (
              <>
                <LibraryTable
                  data={{
                    folders: data?.subFoldersMap || [],
                    files: data?.filesMap || [],
                    linkFiles: data?.linkFilesMap || [],
                  }}
                  handleFolderClick={handleFolderClick}
                  computedPath={computedPath}
                />
                {fetchMore && !isLoading && (
                  <Button onClick={handlePagination} variant="link">
                    Load more data...
                  </Button>
                )}
                <div
                  style={{
                    height: "1px", // Ensure it's visible to the observer
                    marginTop: "10px", // Ensure it's not blocked by other content
                  }}
                  ref={observerTarget}
                />
              </>
            )}
          </>
        ) : (
          <>
            {data &&
            data.subFoldersMap.length === 0 &&
            data.linkFilesMap.length === 0 &&
            data.filesMap.length === 0 ? (
              <EmptyStateComponent title="This folder is empty" />
            ) : (
              <Grid hasGutter={true}>
                <FolderCard
                  folders={data?.subFoldersMap || []}
                  handleFolderClick={handleFolderClick}
                  computedPath={computedPath}
                  pagination={data?.foldersPagination}
                />
                <LinkCard
                  linkFiles={data?.linkFilesMap || []}
                  pagination={data?.linksPagination}
                  computedPath={computedPath}
                />
                <FilesCard
                  files={data?.filesMap || []}
                  computedPath={computedPath}
                  pagination={data?.filesPagination}
                />
                {fetchMore && !isLoading && (
                  <Button onClick={handlePagination} variant="link">
                    Load more data...
                  </Button>
                )}
                <div
                  style={{
                    height: "1px", // Ensure it's visible to the observer
                    marginTop: "10px", // Ensure it's not blocked by other content
                  }}
                  ref={observerTarget}
                />
              </Grid>
            )}
          </>
        )}
      </PageSection>
    </WrapperConnect>
  );
};

export default NewLibrary;
