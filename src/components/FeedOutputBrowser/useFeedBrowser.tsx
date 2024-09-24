import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { fetchFolders } from "../NewLibrary";

const status = ["finishedSuccessfully", "finishedWithError", "cancelled"];

const getInitialDownloadState = () => ({
  count: 0,
  status: false,
  plugin_name: "",
  error: "",
  fetchingFiles: false,
});

export const useFeedBrowser = () => {
  const drawerState = useAppSelector((state) => state.drawers);
  const [download, setDownload] = useState(getInitialDownloadState);
  const [currentPath, setCurrentPath] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const pluginInstances = useAppSelector(
    (state) => state.instance.pluginInstances,
  );

  const selected = useAppSelector((state) => state.instance.selectedPlugin);
  const { data: plugins } = pluginInstances;

  const statusTitle = useAppSelector((state) => {
    if (selected) {
      const id = selected.data.id;
      if (id && state.resource.pluginInstanceStatus[id]) {
        return state.resource.pluginInstanceStatus[id].status;
      }
    }
  });

  const finished = !!(
    (selected && status.includes(selected?.data.status)) ||
    (statusTitle && status.includes(statusTitle))
  );

  const queryKey = ["pluginFiles", currentPath, pageNumber];

  const {
    data: pluginFilesPayload,
    isFetching: filesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFolders(currentPath, pageNumber),
    enabled: !!selected && !!currentPath && finished,
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  // Handle pagination by incrementing the page number
  const handlePagination = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const observerTarget = useRef(null);

  const fetchMore =
    pluginFilesPayload?.foldersPagination?.hasNextPage ||
    pluginFilesPayload?.filesPagination?.hasNextPage ||
    pluginFilesPayload?.linksPagination?.hasNextPage;

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

  useEffect(() => {
    if ((statusTitle && status.includes(statusTitle)) || finished) {
      // User is trying to download a file before it is available
      if (download.error) {
        setDownload((state) => ({
          ...state,
          error: "Files are not ready for download now...",
        }));

        setTimeout(() => {
          setDownload(getInitialDownloadState);
        }, 3000);
      }
    }
  }, [finished, pluginFilesPayload, statusTitle, download.error]);

  useEffect(() => {
    setCurrentPath(selected?.data.output_path);
  }, [selected]);

  const handleFileClick = (path: string) => {
    if (selected) {
      setCurrentPath(path);
    }
  };

  return {
    handleFileClick,
    filesLoading,
    isError,
    error,
    plugins,
    statusTitle,
    download,
    selected,
    pluginFilesPayload,
    filesStatus: drawerState.files,
    previewStatus: drawerState.preview,
    currentPath,
    observerTarget,
    fetchMore,
    handlePagination,
  };
};
