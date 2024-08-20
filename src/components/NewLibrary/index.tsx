import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Button, Grid, PageSection } from "@patternfly/react-core";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Alert, Typography } from "../Antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useTypedSelector } from "../../store/hooks";
import { EmptyStateComponent, InfoIcon, SpinContainer } from "../Common";
import WrapperConnect from "../Wrapper";
import BreadcrumbContainer from "./components/BreadcrumbContainer";
import { FilesCard, LinkCard } from "./components/FileCard";
import { FolderCard } from "./components/FolderCard";
import Operations from "./components/Operations";

const { Paragraph } = Typography;

const NewLibrary = () => {
  // Fetch folders from the server
  async function fetchFolders(computedPath: string, pageNumber: number) {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();
    const pagination = {
      limit: pageNumber * 50,
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

  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const username = useTypedSelector((state) => state.user.username);
  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];
  const computedPath = currentPathSplit || "/";
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["library_folders", computedPath],
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
      <PageSection>
        <InfoIcon
          title="Your Library"
          p1={
            <Paragraph>
              <p>
                The Library provides a card-focused mechanism for browsing,
                viewing, and interacting with data in the ChRIS system. A card
                is analogous to a file or folder in a convention filesystem, and
                multiple cards can be grouped into a shopping cart to allow for
                bulk operations. Simply long press and release a card to add it
                to the cart. Bulk operations include: <b>Download</b> (which
                will copy all cart contents to your local filesystem),{" "}
                <b>Delete</b> (which will permanently remove all data in the
                cards from ChRIS), and <b>Create</b> which will seed a new
                analysis with a new root node containing each card as a
                subdirectory.
              </p>
            </Paragraph>
          }
        />

        <Operations
          inValidateFolders={() => {
            queryClient.refetchQueries({
              queryKey: ["library_folders", computedPath],
            });
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

      <PageSection style={{ paddingBlockStart: "0" }}>
        {isLoading && <SpinContainer title="Fetching Resources..." />}
        {isError && <Alert type="error" description={error.message} />}
        {data &&
          data.subFoldersMap.length === 0 &&
          data.linkFilesMap.length === 0 &&
          data.filesMap.length === 0 && (
            <EmptyStateComponent title="This folder is empty" />
          )}
        {data ? (
          <Grid hasGutter={true}>
            <FolderCard
              folders={data.subFoldersMap}
              handleFolderClick={handleFolderClick}
              computedPath={computedPath}
              pagination={data.foldersPagination}
            />
            <LinkCard
              linkFiles={data.linkFilesMap}
              pagination={data.linksPagination}
              computedPath={computedPath}
            />
            <FilesCard
              files={data.filesMap}
              computedPath={computedPath}
              pagination={data.filesPagination}
            />
            {fetchMore && !isLoading && (
              <Button onClick={handlePagination} variant="link">
                {" "}
                Load more data...
              </Button>
            )}
            <div
              style={{
                height: "10px",
              }}
              ref={observerTarget}
            />
          </Grid>
        ) : (
          <EmptyStateComponent title="No data fetched yet..." />
        )}
      </PageSection>
    </WrapperConnect>
  );
};

export default NewLibrary;
