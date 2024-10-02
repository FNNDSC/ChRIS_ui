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
import { useAppSelector } from "../../store/hooks";
import { Alert } from "../Antd";
import { EmptyStateComponent, SpinContainer } from "../Common";
import { InfoSection } from "../Common";
import WrapperConnect from "../Wrapper";
import BreadcrumbContainer from "./components/BreadcrumbContainer";
import { FilesCard, LinkCard } from "./components/FileCard";
import { FolderCard } from "./components/FolderCard";
import LibraryTable from "./components/LibraryTable";
import Operations from "./components/Operations";
import { OperationContext } from "./context";
import { notification } from "../Antd";

// Fetch folders from the server
export async function fetchFolders(computedPath: string, pageNumber?: number) {
  const client = ChrisAPIClient.getClient();
  await client.setUrls();

  const pagination = {
    limit: pageNumber ? pageNumber * 50 : 100,
    offset: 0,
  };

  const errorMessages: string[] = [];

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
        // Fetch children, link files, and folder files with individual try-catch blocks
        try {
          const children = await folder.getChildren(pagination);
          subFoldersMap = children.getItems();
          foldersPagination = {
            totalCount: children.totalCount,
            hasNextPage: children.hasNextPage,
          };
        } catch (error) {
          console.error("Error fetching folder children:", error);
          errorMessages.push("Failed to fetch subfolders.");
        }

        try {
          const linkFiles = await folder.getLinkFiles(pagination);
          linkFilesMap = linkFiles.getItems();
          linksPagination = {
            totalCount: linkFiles.totalCount,
            hasNextPage: linkFiles.hasNextPage,
          };
        } catch (error) {
          console.error("Error fetching link files:", error);
          errorMessages.push("Failed to fetch link files.");
        }

        try {
          const folderFiles = await folder.getFiles(pagination);
          filesMap = folderFiles.getItems();
          filesPagination = {
            totalCount: folderFiles.totalCount,
            hasNextPage: folderFiles.hasNextPage,
          };
        } catch (error) {
          errorMessages.push("Failed to fetch files.");
        }
      }
    }

    return {
      subFoldersMap,
      linkFilesMap,
      filesMap,
      filesPagination,
      foldersPagination,
      linksPagination,
      folderList, // return folderList to enable creating new folders
      errorMessages, // return any error messages encountered
    };
  } catch (e) {
    errorMessages.push("Failed to load folder list.");
    return { errorMessages }; // return errors in case the request fails entirely
  }
}

const NewLibrary = () => {
  const [api, contextHolder] = notification.useNotification();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const username = useAppSelector((state) => state.user.username);
  const currentLayout = useAppSelector((state) => state.cart.currentLayout);
  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || "/";
  const queryKey = ["library_folders", computedPath, pageNumber];
  const { data, isFetching, isError, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  // Redirect to /library/home/username if the pathname is /library and this is the first load of the page
  useEffect(() => {
    if (isFirstLoad && pathname === "/library") {
      navigate(`/library/home/${username}`, { replace: true });
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, pathname, username, navigate]);

  // Show error notifications
  useEffect(() => {
    if (data?.errorMessages && data.errorMessages.length > 0) {
      data.errorMessages.forEach((msg: string) => {
        api.error({
          message: "Error",
          description: msg,
        });
      });
    }
  }, [data?.errorMessages]);

  const fetchMore =
    data?.foldersPagination?.hasNextPage ||
    data?.filesPagination?.hasNextPage ||
    data?.linksPagination?.hasNextPage;

  const handleFolderClick = debounce((folder: string) => {
    const url = `${decodedPath}/${folder}`;
    navigate(url);
  }, 500);

  const handlePagination = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const observerTarget = useRef(null);

  if (isFirstLoad && pathname === "/library") {
    return null;
  }

  const TitleComponent = (
    <InfoSection
      title="Your Library"
      content={
        <>
          The Library provides a card-focused mechanism for browsing, viewing,
          and interacting with data in the ChRIS system. A card is analogous to
          a file or folder in a conventional filesystem, and multiple cards can
          be grouped into a shopping cart to allow for bulk operations.
        </>
      }
    />
  );

  return (
    <WrapperConnect titleComponent={TitleComponent}>
      {contextHolder}
      <PageSection
        stickyOnBreakpoint={{
          default: "top",
        }}
        style={{ padding: "0" }}
      >
        <Operations
          origin={{
            type: OperationContext.LIBRARY,
            additionalKeys: [computedPath],
          }}
          computedPath={computedPath}
          folderList={data?.folderList}
        />
        <BreadcrumbContainer
          path={computedPath}
          handleFolderClick={(path: string) => {
            navigate(path);
          }}
          username={username as string}
        />
      </PageSection>

      <PageSection style={{ padding: "0" }}>
        {isFetching && <SpinContainer title="Fetching Resources..." />}
        {isError && <Alert type="error" description={error.message} />}
        {/* Render based on currentLayout */}
        {currentLayout === "list" ? (
          <>
            {data?.subFoldersMap?.length === 0 &&
            data?.linkFilesMap?.length === 0 &&
            data?.filesMap?.length === 0 ? (
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
                  fetchMore={fetchMore}
                  handlePagination={handlePagination}
                  filesLoading={isFetching}
                />
                {fetchMore && !isFetching && (
                  <Button onClick={handlePagination} variant="link">
                    Load more data...
                  </Button>
                )}
                <div
                  ref={observerTarget}
                  style={{ height: "1px", marginTop: "10px" }}
                />
              </>
            )}
          </>
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
              list={data?.filesMap}
              fetchMore={fetchMore}
              handlePagination={handlePagination}
              filesLoading={isFetching}
            />
            {fetchMore && !isFetching && (
              <Button onClick={handlePagination} variant="link">
                Load more data...
              </Button>
            )}
            <div
              ref={observerTarget}
              style={{ height: "1px", marginTop: "10px" }}
            />
          </Grid>
        )}
      </PageSection>
    </WrapperConnect>
  );
};

export default NewLibrary;
