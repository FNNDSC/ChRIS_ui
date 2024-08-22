import type {
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { catchError, fetchResource } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import type { FilesPayload } from "./types";

const status = ["finishedSuccessfully", "finishedWithError", "cancelled"];

const getInitialDownloadState = () => ({
  count: 0,
  status: false,
  plugin_name: "",
  error: "",
  fetchingFiles: false,
});

export const fetchFilesFromAPath = async (
  path: string,
): Promise<FilesPayload> => {
  const client = ChrisAPIClient.getClient();
  const foldersList = await client.getFileBrowserFolders({
    path,
  });

  const folders = foldersList.getItems();

  if (folders) {
    const folder = folders[0];
    if (folder) {
      const pagination = { limit: 100, offset: 0 };
      const fetchChildren = folder.getChildren;
      const boundChildren = fetchChildren.bind(folder);

      try {
        const { resource: children } = await fetchResource(
          pagination,
          boundChildren,
        );
        const linkFilesFn = folder.getLinkFiles;
        const boundLinkFilesFn = linkFilesFn.bind(folder);
        const { resource: linkFiles } =
          await fetchResource<FileBrowserFolderLinkFile>(
            pagination,
            boundLinkFilesFn,
          );
        const filesFn = folder.getFiles;
        const boundFilesFn = filesFn.bind(folder);
        const { resource: folderFiles } =
          await fetchResource<FileBrowserFolderFile>(pagination, boundFilesFn);

        return {
          folderFiles: folderFiles,
          linkFiles: linkFiles,
          children: children,
          folderList: foldersList,
          path,
        };
      } catch (error) {
        const errorMessage = catchError(error).error_message;
        throw new Error(errorMessage);
      }
    }
  }

  return {
    folderFiles: [],
    linkFiles: [],
    children: [],
    folderList: undefined,
    path,
  };
};

export const useFeedBrowser = () => {
  const queryClient = useQueryClient();
  const drawerState = useTypedSelector((state) => state.drawers);
  const [download, setDownload] = React.useState(getInitialDownloadState);
  const [currentPath, setCurrentPath] = React.useState("");

  const pluginInstances = useTypedSelector(
    (state) => state.instance.pluginInstances,
  );

  const selected = useTypedSelector((state) => state.instance.selectedPlugin);
  const { data: plugins } = pluginInstances;

  const statusTitle = useTypedSelector((state) => {
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

  const queryKey = ["pluginFiles", currentPath];

  const {
    data: pluginFilesPayload,
    isLoading: filesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchFilesFromAPath(currentPath),
    enabled: !!selected && !!currentPath && finished,
  });

  React.useEffect(() => {
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

  React.useEffect(() => {
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
  };
};
