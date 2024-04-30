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

const NewLibrary = () => {
  async function fetchFolders(computedPath: string, pageNumber: number) {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();

    const pagination = {
      limit: pageNumber * 20,
      offset: 0,
    };

    try {
      const folderList = await client.getFileBrowserFolders({
        path: computedPath,
      });

      const folders = folderList.getItems();
      const subFoldersMap = new Map();
      const linkFilesMap = new Map();
      const filesMap = new Map();
      const initialPaginateValue = {
        totalCount: 0,
        hasNextPage: false,
      };
      let filesPagination = initialPaginateValue;
      let foldersPagination = initialPaginateValue;
      let linksPagination = initialPaginateValue;

      if (folders) {
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
  const [pageNumber, setPageNumber] = useState(1);

  const decodedPath = decodeURIComponent(pathname);
  const currentPathSplit = decodedPath.split("/library/")[1];

  const computedPath = currentPathSplit || "/";

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["folders", computedPath, pageNumber],
    queryFn: () => fetchFolders(computedPath, pageNumber),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

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
        console.log("Scrolling", fetchMore, entries[0].isIntersecting);
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
    </WrapperConnect>
  );
};

export default NewLibrary;
