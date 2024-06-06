import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  PipelineList,
  PluginInstance,
} from "@fnndsc/chrisapi";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState, useEffect, useCallback } from "react";
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

const useOperations = () => {
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

  const [feedCreationError, setFeedCreationError] = useState<{
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

  const resetErrors = useCallback(() => {
    setFeedCreationError({ paths: [], error_message: "" });
    setDownloadError({ paths: [], error_message: "" });
  }, []);

  useEffect(() => {
    // recreate state whenever the component first mounts from session storage
    recreateState();
  }, []);

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
      setFeedCreationError({
        ...feedCreationError,
        paths: [...feedCreationError.paths, ...invalidPaths],
        error_message: "Please avoid creating feeds with folders listed here:",
      });
    }
    if (validPaths.length > 0) {
      router.actions.createFeedWithData(validPaths);
    }
  };

  const clearFeed = useCallback(() => {
    router.actions.clearFeedData();
  }, [router.actions]);

  const clearPathSessionStorage = useCallback(
    (path: string, id: number) => {
      const copiedState = { ...state };
      const newSelectedPaths = copiedState.selectedPaths.filter(
        (pathObj) => pathObj.path !== path,
      );

      if (!isEmpty(FolderDownloadTypes)) {
        delete copiedState.folderDownloadStatus[id];
      }

      localStorage.setItem("selectedPaths", JSON.stringify(newSelectedPaths));
      localStorage.setItem(
        "folderDownloadStatus",
        JSON.stringify(copiedState.folderDownloadStatus),
      );
    },
    [state],
  );

  const keepACopyInState = useCallback(() => {
    if (!isEmpty(state.folderDownloadStatus)) {
      localStorage.setItem(
        "folderDownloadStatus",
        JSON.stringify(state.folderDownloadStatus),
      );
    }
    if (!isEmpty(state.selectedPaths)) {
      localStorage.setItem(
        "selectedPaths",
        JSON.stringify(state.selectedPaths),
      );
    }
  }, [state.folderDownloadStatus, state.selectedPaths]);

  const pickDownloadsFromSession = useCallback(
    async (selectedPaths: any, folderDownloadStatus: any) => {
      const downloadPromises = selectedPaths.map(async (userSelection: any) => {
        const { type, payload } = userSelection;
        if (type === "folder") {
          const { currentStatus, pipelineType } =
            folderDownloadStatus[payload.data.id];
          if (currentStatus === FolderDownloadTypes.zippingFolder) {
            const data = await checkIfFeedExists(payload, pipelineType);
            if (!data || !data.feed || !data.createdInstance) {
              setDownloadErrorState(
                payload as FileBrowserFolder,
                payload.data.path,
                "Error downloading this folder/file",
                pipelineType,
              );
            } else {
              const { feed, createdInstance } = data;
              dispatch(
                downloadFolderStatus(
                  payload as FileBrowserFolder,
                  FolderDownloadTypes.zippingFolder,
                  pipelineType,
                ),
              );
              await createPipelineDuringDownload(
                payload as FileBrowserFolder,
                payload.data.path,
                createdInstance,
                feed,
                pipelineType,
              );
            }
          }
        }
      });

      await Promise.all(downloadPromises);
    },
    [dispatch],
  );

  const recreateState = useCallback(async () => {
    const client = ChrisAPIClient.getClient();
    const folderDownloadStatus = JSON.parse(
      localStorage.getItem("folderDownloadStatus") || "{}",
    );
    const selectedPaths = JSON.parse(
      localStorage.getItem("selectedPaths") || "[]",
    );

    if (isEmpty(state.selectedPaths) && !isEmpty(selectedPaths)) {
      try {
        const updatedSelectedPaths = await Promise.all(
          selectedPaths.map(async (path: any) => {
            const url = new URL(path.payload.url);
            const pathname = url.pathname;
            const parts = pathname.split("/");
            const id = parts[parts.length - 2];
            const folder = await client.getFileBrowserFolder(+id);
            path.payload = folder;
            return path;
          }),
        );
        dispatch(setSelectedFolderFromCookies(updatedSelectedPaths));
        if (
          isEmpty(state.folderDownloadStatus) &&
          !isEmpty(folderDownloadStatus)
        ) {
          dispatch(setDownloadStatusFromCookies(folderDownloadStatus));
          await pickDownloadsFromSession(
            updatedSelectedPaths,
            folderDownloadStatus,
          );
        }
      } catch (error) {
        console.error("Error", error);
      }
    }
  }, [
    dispatch,
    pickDownloadsFromSession,
    state.folderDownloadStatus,
    state.selectedPaths,
  ]);

  const setDownloadErrorState = useCallback(
    (
      payload: FileBrowserFolder,
      path: string,
      error_message: string,
      pipelineType: string,
    ) => {
      dispatch(
        downloadFolderStatus(
          payload as FileBrowserFolder,
          FolderDownloadTypes.cancelled,
          pipelineType,
        ),
      );
      setDownloadError({
        paths: [...downloadError.paths, path],
        error_message,
      });
    },
    [dispatch, downloadError.paths],
  );

  const checkIfFeedExists = useCallback(
    async (payload: FileBrowserFolder, pipelineType: string) => {
      const path = payload.data.path;
      const dircopy = await getPlugin("pl-dircopy");
      if (!dircopy) {
        setDownloadErrorState(
          payload as FileBrowserFolder,
          path,
          "Failed to find dircopy",
          pipelineType,
        );
        return { feed: undefined, folderName: "", createdInstance: undefined };
      }
      const client = ChrisAPIClient.getClient();
      const folderNameList = payload.data.path.split("/");
      const folderName =
        folderNameList[folderNameList.length - 1] || payload.data.id;

      const feedExists = await client.getFeeds({
        name: `Library ${pipelineType} for ${folderName}`,
      });

      let createdInstance: PluginInstance | undefined;
      let feed: Feed | undefined;

      if (feedExists?.data) {
        const feeds = feedExists.getItems();
        feed = feeds?.[0];
        const pluginInstances = await feed?.getPluginInstances({});
        const pluginInstancesItems = pluginInstances?.getItems();
        if (pluginInstancesItems) {
          createdInstance =
            pluginInstancesItems[pluginInstancesItems.length - 1];
        }
      } else {
        createdInstance = await client.createPluginInstance(dircopy.data.id, {
          //@ts-ignore
          dir: path,
        });
        feed = (await createdInstance.getFeed()) as Feed;
        await feed?.put({ name: `Library ${pipelineType} for ${folderName}` });
      }
      return { feed, createdInstance, folderName };
    },
    [setDownloadErrorState],
  );

  const createFeedDuringDownload = async (
    payload: FileBrowserFolder,
    path: string,
    pipelineType: string,
  ) => {
    const data = await checkIfFeedExists(
      payload as FileBrowserFolder,
      pipelineType,
    );

    if (!data) {
      setDownloadErrorState(
        payload as FileBrowserFolder,
        path,
        "Failed to create a Feed",
        pipelineType,
      );
    }

    return { feed: data?.feed, createdInstance: data?.createdInstance };
  };

  const pollZipInstance = async (
    zipInstance: PluginInstance,
    filePath: string,
    path: string,
    payload: FileBrowserFolder,
    pipelineType: string,
  ) => {
    const client = ChrisAPIClient.getClient();
    const statusReq = await zipInstance.get();
    let status = statusReq.data.status;

    while (status !== "finishedSuccessfully") {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
      const statusReq = await zipInstance.get();
      status = statusReq.data.status;
    }

    if (status === "finishedSuccessfully") {
      const folderList = await client.getFileBrowserFolders({
        path: filePath,
      });

      if (!folderList) {
        setDownloadErrorState(
          payload as FileBrowserFolder,
          path,
          `Failed to find files under this ${filePath}`,
          pipelineType,
        );
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
            pipelineType,
          ),
        );
      }
    }
  };

  const createPipelineDuringDownload = async (
    payload: FileBrowserFolder,
    path: string,
    createdInstance: PluginInstance,
    feed: Feed,
    type,
  ) => {
    try {
      const client = ChrisAPIClient.getClient();

      let pipelineList: PipelineList | null = null;
      if (type === "download") {
        /** Zipping */
        pipelineList = await client.getPipelines({
          name: "zip v20240311",
        });
      }

      if (type === "anonymize") {
        pipelineList = await client.getPipelines({
          name: "DICOM anonymization simple v20230926",
        });
      }

      if (!pipelineList || !pipelineList.data) {
        setDownloadErrorState(
          payload as FileBrowserFolder,
          path,
          "Please register the zip pipeline with the name v20240311",
          type,
        );
      }

      if (pipelineList) {
        const pipelines = pipelineList.getItems();

        // Check first if a zip pipeline was already added

        const pluginInstancesList = await feed.getPluginInstances({
          limit: 100,
        });

        const pluginInstances = pluginInstancesList.getItems();

        if (pluginInstances && pluginInstances.length > 1) {
          const zipInstance = pluginInstances[0];

          let filePath = "";

          if (type === "download") {
            filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
          }
          if (type === "anonymize") {
            const headerEditInstance =
              pluginInstances[pluginInstances.length - 1];
            filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-dicom_headeredit_${headerEditInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
          }
          await pollZipInstance(zipInstance, filePath, path, payload, type);
        } else {
          // Plugin Instance does not exist and you need to create it.
          if (pipelines && pipelines.length > 0) {
            const pipeline = pipelines[0];

            const { id } = pipeline.data;

            //@ts-ignore
            const workflow = await client.createWorkflow(id, {
              previous_plugin_inst_id: createdInstance.data.id,
            });

            const pluginInstancesList = await workflow.getPluginInstances({
              limit: 3,
            });
            const pluginInstances = pluginInstancesList.getItems();

            if (pluginInstances && pluginInstances.length > 0) {
              const zipInstance = pluginInstances[0];
              const headerEditInstance = pluginInstances[1];

              let filePath = "";

              if (type === "download") {
                filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
              }
              if (type === "anonymize") {
                filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-dicom_headeredit_${headerEditInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
              }

              await pollZipInstance(zipInstance, filePath, path, payload, type);
            }
          }
        }
      }
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <explanation>
      throw error;
    }
  };

  const handleDownload = async (pipelineType: string) => {
    const { selectedPaths } = state;

    const downloadPromises = selectedPaths.map(async (userSelection) => {
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
            pipelineType,
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
            pipelineType,
          );
        } else {
          dispatch(
            downloadFolderStatus(
              payload as FileBrowserFolder,
              FolderDownloadTypes.creatingFeed,
              pipelineType,
            ),
          );

          /** Create */
          const data = await createFeedDuringDownload(
            payload as FileBrowserFolder,
            path,
            pipelineType,
          );

          if (!data || !data.feed || !data.createdInstance) {
            setDownloadErrorState(
              payload as FileBrowserFolder,
              path,
              "Error downloading this folder/file",
              pipelineType,
            );
          } else {
            const { feed, createdInstance } = data;

            dispatch(
              downloadFolderStatus(
                payload as FileBrowserFolder,
                FolderDownloadTypes.zippingFolder,
                pipelineType,
              ),
            );

            await createPipelineDuringDownload(
              payload as FileBrowserFolder,
              path,
              createdInstance,
              feed,
              pipelineType,
            );
          }
        }
      }
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
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
    mutationFn: ({ type }: { type: string }) => handleDownload(type),
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
    clearPathSessionStorage,
    keepACopyInState,
  };
};

export default useOperations;
