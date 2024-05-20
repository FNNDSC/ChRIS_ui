import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { MainRouterContext } from "../../App";
import { useTypedSelector } from "../../store/hooks";
import { getPlugin } from "../CreateFeed/createFeedHelper";
import {
  DownloadTypes,
  FolderDownloadTypes,
  LibraryContext,
  LibraryState,
} from "./context";
import {
  downloadFileStatus,
  downloadFolderStatus,
  setSelectedFolderFromCookies,
} from "./context/actions";
import { downloadFile } from "./useDownloadHook";
import { isEmpty } from "lodash";
import { useCookies, Cookies } from "react-cookie";

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
    validPaths.length > 0 && router.actions.createFeedWithData(validPaths);
  };

  const clearFeed = () => {
    router.actions.clearFeedData();
  };

  const keepACopyInState = (statePassed?: LibraryState) => {
    const stateToUse = statePassed ? statePassed : state;
    const oneDayToSeconds = 24 * 60 * 60;
    setCookie("folderDownloadStatus", stateToUse.folderDownloadStatus, {
      path: "/",
      maxAge: oneDayToSeconds,
    });
    setCookie("selectedPaths", stateToUse.selectedPaths, {
      path: "/",
      maxAge: oneDayToSeconds,
    });
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
        keepACopyInState();

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

        const client = ChrisAPIClient.getClient();

        dispatch(
          downloadFolderStatus(
            payload as FileBrowserFolder,
            FolderDownloadTypes.creatingFeed,
          ),
        );
        keepACopyInState();

        const dircopy = await getPlugin("pl-dircopy");

        if (!dircopy) {
          setDownloadErrorState(
            payload as FileBrowserFolder,
            path,
            "Failed to find dircopy",
          );
          continue;
        }

        if (dircopy) {
          const createdInstance = await client.createPluginInstance(
            dircopy.data.id,
            {
              //@ts-ignore
              dir: path,
            },
          );

          const feed = (await createdInstance.getFeed()) as Feed;

          if (!feed) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              "Failed to create a Feed",
            );
            continue;
          }

          const folderNameList = payload.data.path.split("/");
          const folderName =
            folderNameList[folderNameList.length - 1] || payload.data.id;

          await feed.put({
            name: `Library Download for ${folderName}`,
          });

          dispatch(
            downloadFolderStatus(
              payload as FileBrowserFolder,
              FolderDownloadTypes.zippingFolder,
            ),
          );
          keepACopyInState();

          const pipelineList = await client.getPipelines({
            name: "zip v20240311",
          });

          if (!pipelineList.data) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              "Please register the zip pipeline with the name v20240311",
            );
            continue;
          }

          const pipelines = pipelineList.getItems();

          if (pipelines && pipelines.length > 0) {
            const pipeline = pipelines[0];

            const { id } = pipeline.data;

            //@ts-ignore
            const workflow = await client.createWorkflow(id, {
              previous_plugin_inst_id: createdInstance?.data.id,
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
                  continue;
                }

                const folders = folderList.getItems();

                if (folders) {
                  const folder = folders[0];
                  const files = await folder.getFiles();
                  const fileItems = files.getItems();
                  const fileToZip = fileItems[0];
                  await downloadFile(fileToZip);
                  dispatch(
                    downloadFolderStatus(
                      payload as FileBrowserFolder,
                      FolderDownloadTypes.finished,
                    ),
                  );
                  keepACopyInState();
                  await feed.delete();
                }
              }
            }
          }
        }
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
    keepACopyInState,
  };
};

export default useOperations;
