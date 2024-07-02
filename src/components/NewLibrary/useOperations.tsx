import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  PluginInstance,
} from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState, useEffect } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { MainRouterContext } from "../../App";
import { useTypedSelector } from "../../store/hooks";
import { getPlugin } from "../CreateFeed/createFeedHelper";
import { DownloadTypes, FolderDownloadTypes, LibraryContext } from "./context";
import {
  downloadFileStatus,
  downloadFolderStatus,
  setDownloadStatusFromCookies,
  setSelectedFolderFromCookies,
} from "./context/actions";
import { downloadFile } from "./useDownloadHook";
import { isEmpty } from "lodash";
import { useCookies, Cookies } from "react-cookie";

const oneDayToSeconds = 24 * 60 * 60;
const useOperations = () => {
  const [_cookies, setCookie] = useCookies();
  const cookie = new Cookies();
  const router = useContext(MainRouterContext);
  const { state, dispatch } = useContext(LibraryContext);
  const username = useTypedSelector((state) => state.user.username);
  const cannotDownload = [
    "home",
    `home/${username}`,
    `home/${username}/uploads`,
    "SERVICES",
    "PIPELINES",
  ];

  const [feedCreationError, setFeedCreatorError] = useState<{
    paths: string[];
    error_message: string;
  }>({
    paths: [],
    error_message: "",
  });

  const [downloadError, setDownloadError] = useState<{
    paths: string[];
    error_message: string;
  }>({
    paths: [],
    error_message: "",
  });

  const resetErrors = () => {
    setFeedCreatorError({
      paths: [],
      error_message: "",
    });
    setDownloadError({
      paths: [],
      error_message: "",
    });
  };

  useEffect(() => {
    keepACopyInState();
  }, [state.folderDownloadStatus, state.selectedPaths]);

  const createFeed = () => {
    const invalidPaths: string[] = [];
    const validPaths: string[] = [];
    state.selectedPaths.forEach(({ path }) => {
      if (cannotDownload.includes(path)) {
        invalidPaths.push(path);
      } else {
        validPaths.push(path);
      }
    });

    if (invalidPaths.length > 0) {
      setFeedCreatorError({
        ...feedCreationError,
        paths: [...feedCreationError.paths, ...invalidPaths],
        error_message: "Please avoid creating feeds with folders listed here:",
      });
    }
    if (validPaths.length > 0) {
      router.actions.createFeedWithData(validPaths);
    }
  };

  const clearFeed = () => {
    router.actions.clearFeedData();
  };

  const clearPathCookie = (path: string) => {
    const copiedState = { ...state };
    const newSelectedPaths = copiedState.selectedPaths.filter((pathObj) => {
      return pathObj.path !== path;
    });

    setCookie("selectedPaths", newSelectedPaths, {
      path: "/",
      maxAge: oneDayToSeconds,
    });
  };

  const keepACopyInState = () => {
    if (!isEmpty(state.folderDownloadStatus)) {
      setCookie("folderDownloadStatus", state.folderDownloadStatus, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
    }

    if (!isEmpty(state.selectedPaths)) {
      setCookie("selectedPaths", state.selectedPaths, {
        path: "/",
        maxAge: oneDayToSeconds,
      });
    }
  };

  const recreateState = async () => {
    const client = ChrisAPIClient.getClient();

    try {
      const folderDownloadStatus = cookie.get("folderDownloadStatus");
      const selectedPaths = cookie.get("selectedPaths");

      if (isEmpty(state.selectedPaths) && !isEmpty(selectedPaths)) {
        for (const path of selectedPaths) {
          const url = new URL(path.payload.url);
          const pathname = url.pathname;
          const parts = pathname.split("/");
          const id = parts[parts.length - 2];
          const folder = await client.getFileBrowserFolder(+id);
          path.payload = folder;
        }
        dispatch(setSelectedFolderFromCookies(selectedPaths));
      }

      if (
        isEmpty(state.folderDownloadStatus) &&
        !isEmpty(folderDownloadStatus)
      ) {
        dispatch(setDownloadStatusFromCookies(folderDownloadStatus));
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const setDownloadErrorState = (
    payload: FileBrowserFolder,
    path: string,
    error_message: string,
  ) => {
    dispatch(
      downloadFolderStatus(
        payload as FileBrowserFolder,
        FolderDownloadTypes.cancelled,
      ),
    );
    setDownloadError({
      ...downloadError,
      paths: [...downloadError.paths, path],
      error_message,
    });
  };

  const createFeedDuringDownload = async (
    payload: FileBrowserFolder,
    path: string,
  ) => {
    const client = ChrisAPIClient.getClient();
    const dircopy = await getPlugin("pl-dircopy");

    if (!dircopy) {
      setDownloadErrorState(
        payload as FileBrowserFolder,
        path,
        "Failed to find dircopy",
      );
      return;
    }

    const createdInstance = await client.createPluginInstance(dircopy.data.id, {
      //@ts-ignore
      dir: path,
    });

    const feed = (await createdInstance.getFeed()) as Feed;

    if (!feed) {
      setDownloadErrorState(
        payload as FileBrowserFolder,
        path,
        "Failed to create a Feed",
      );
      return;
    }

    const folderNameList = payload.data.path.split("/");
    const folderName =
      folderNameList[folderNameList.length - 1] || payload.data.id;
    await feed.put({
      name: `Library Download for ${folderName}`,
    });

    return { feed, createdInstance };
  };

  const createPipelineDuringDownload = async (
    payload: FileBrowserFolder,
    path: string,
    createdInstance: PluginInstance,
    feed: Feed,
  ) => {
    const client = ChrisAPIClient.getClient();
    /** Zipping */
    const pipelineList = await client.getPipelines({
      name: "zip v20240311",
    });

    if (!pipelineList.data) {
      setDownloadErrorState(
        payload as FileBrowserFolder,
        path,
        "Please register the zip pipeline with the name v20240311",
      );
    }

    const pipelines = pipelineList.getItems();

    if (pipelines && pipelines.length > 0) {
      const pipeline = pipelines[0];

      const { id } = pipeline.data;

      //@ts-ignore
      const workflow = await client.createWorkflow(id, {
        previous_plugin_inst_id: createdInstance.data.id,
      });

      const pluginInstancesList = await workflow.getPluginInstances({
        limit: 2,
      });
      const pluginInstances = pluginInstancesList.getItems();

      if (pluginInstances && pluginInstances.length > 0) {
        const zipInstance = pluginInstances[pluginInstances.length - 1];
        const statusReq = await zipInstance.get();
        let status = statusReq.data.status;

        while (status !== "finishedSuccessfully") {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
          const statusReq = await zipInstance.get();
          status = statusReq.data.status;
        }

        const filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;

        if (status === "finishedSuccessfully") {
          const folderList = await client.getFileBrowserFolders({
            path: filePath,
          });

          if (!folderList) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              `Failed to find files under this ${filePath}`,
            );
          }

          const folders = folderList.getItems();

          if (folders) {
            const folder = folders[0];
            const files = await folder.getFiles();
            const fileItems = files.getItems();
            const fileToZip = fileItems[0];
            await downloadFile(fileToZip);
            await feed.delete();
          }
          dispatch(
            downloadFolderStatus(
              payload as FileBrowserFolder,
              FolderDownloadTypes.finished,
            ),
          );
        }
      }
    }
  };

  const handleDownload = async () => {
    const { selectedPaths } = state;

    for (const userSelection of selectedPaths) {
      const { type, payload } = userSelection;

      if (type === "file") {
        dispatch(
          downloadFileStatus(
            payload as FileBrowserFolderFile,
            DownloadTypes.progress,
          ),
        );
        const file = await downloadFile(payload as FileBrowserFolderFile);

        if (file) {
          dispatch(
            downloadFileStatus(
              payload as FileBrowserFolderFile,
              DownloadTypes.finished,
            ),
          );
        }
      }

      if (type === "folder") {
        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.started,
          ),
        );

        const path = payload.data.path;
        if (cannotDownload.includes(path)) {
          setDownloadErrorState(
            payload as FileBrowserFolder,
            path,
            `Please don't zip folders in this list: ${cannotDownload.join(
              ", ",
            )}`,
          );
          continue;
        }

        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.creatingFeed,
          ),
        );

        /** Create */
        const data = await createFeedDuringDownload(
          payload as FileBrowserFolder,
          path,
        );

        if (!data || !data.feed || !data.createdInstance) {
          continue;
        }

        const { feed, createdInstance } = data;

        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.zippingFolder,
          ),
        );
        await createPipelineDuringDownload(
          payload as FileBrowserFolder,
          path,
          createdInstance,
          feed,
        );
      }
    }
  };

  const handleDelete = async () => {
    const client = ChrisAPIClient.getClient();

    await Promise.all(
      state.selectedPaths.map(async (path) => {
        const url = path.payload.url;
        await axios.delete(url, {
          headers: {
            Authorization: `Token ${client.auth.token}`,
          },
        });
      }),
    );
  };

  const handleDownloadMutation = useMutation({
    mutationFn: () => handleDownload(),
  });

  const handleDeleteMutation = useMutation({
    mutationFn: () => handleDelete(),
  });

  return {
    handleDownloadMutation,
    handleDeleteMutation,
    createFeed,
    clearFeed,
    feedCreationError,
    downloadError,
    cannotDownload,
    resetErrors,
    recreateState,
    clearPathCookie,
    keepACopyInState,
  };
};

export default useOperations;
