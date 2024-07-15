import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { Grid } from "@patternfly/react-core";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { EmptyStateComponent } from "../Common";
import WrapperConnect from "../Wrapper";
import { FilesCard, LinkCard } from "./components/FileCard";
import { FolderCard } from "./components/FolderCard";

const NewLibrary = () => {
  async function fetchFolders(computedPath: string, pageNumber: number) {
    const client = ChrisAPIClient.getClient();
    await client.setUrls();
    const pagination = {
      limit: 30,
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
      };
    } catch (e) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw e;
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
  const { data, isLoading, isError, error } = useQuery({
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
          />
          <FilesCard files={data.filesMap} pagination={data.filesPagination} />
        </Grid>
      ) : (
        <EmptyStateComponent title="No data fetched yet..." />
      )}
    </WrapperConnect>
  );
};

export default NewLibrary;
