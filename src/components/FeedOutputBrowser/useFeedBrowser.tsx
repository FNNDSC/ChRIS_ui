import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { fetchFolders } from "../NewLibrary";

// Terminal plugin statuses
const TERMINAL_STATUSES = [
  "finishedSuccessfully",
  "finishedWithError",
  "cancelled",
];

// Helper: initial download state
const getInitialDownloadState = () => ({
  count: 0,
  status: false,
  plugin_name: "",
  error: "",
  fetchingFiles: false,
});

/**
 * Custom hook to browse feed output files for a selected plugin.
 * It conditionally fetches files only if the plugin is finished.
 *
 * @param statuses A dictionary of pluginId -> polled status
 */
export const useFeedBrowser = (statuses: Record<number, string>) => {
  // Redux states
  const drawerState = useAppSelector((state) => state.drawers);
  const selected = useAppSelector((state) => state.instance.selectedPlugin);

  // Local states
  const [download, setDownload] = useState(getInitialDownloadState);
  const [currentPath, setCurrentPath] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  // Check if the plugin is in a terminal status
  const isFinished =
    TERMINAL_STATUSES.includes(statuses[selected?.data.id]) ||
    TERMINAL_STATUSES.includes(selected?.data.status);

  // React Query: fetch plugin files, conditionally enabled if plugin is finished
  const queryKey = ["pluginFiles", currentPath, pageNumber];
  const {
    data: pluginFilesPayload,
    isFetching: filesLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchFolders(currentPath, pageNumber),
    enabled: Boolean(selected && currentPath && isFinished),
    placeholderData: keepPreviousData,
    structuralSharing: true,
  });

  // Handle pagination
  const handlePagination = useCallback(() => {
    setPageNumber((prev) => prev + 1);
  }, []);

  // Check if more data can be fetched
  const fetchMore =
    pluginFilesPayload?.foldersPagination?.hasNextPage ||
    pluginFilesPayload?.filesPagination?.hasNextPage ||
    pluginFilesPayload?.linksPagination?.hasNextPage;

  // Intersection observer to auto-fetch next page when scrolled to bottom
  const observerTarget = useRef<HTMLDivElement | null>(null);
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
  }, [fetchMore, handlePagination]);

  // Display a temporary error if files are not yet ready
  useEffect(() => {
    if (isFinished && download.error) {
      setDownload((prev) => ({
        ...prev,
        error: "Files are not ready for download now...",
      }));

      setTimeout(() => {
        setDownload(getInitialDownloadState);
      }, 3000);
    }
  }, [isFinished, download.error]);

  // Update path whenever a new plugin is selected
  useEffect(() => {
    setCurrentPath(selected?.data.output_path || "");
  }, [selected]);

  // File click handler
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
    download,
    selected,
    pluginFilesPayload,
    filesStatus: drawerState.files,
    previewStatus: drawerState.preview,
    currentPath,
    observerTarget,
    fetchMore,
    finished: isFinished,
    handlePagination,
  };
};
