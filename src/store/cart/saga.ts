import type {
  Feed,
  FileBrowserFolder,
  FileBrowserFolderFile,
  FileBrowserFolderFileList,
  ItemResource,
  Pipeline,
  PipelineList,
  Plugin,
  PluginInstance,
  PluginInstanceList,
  Workflow,
} from "@fnndsc/chrisapi";
import type Client from "@fnndsc/chrisapi";
import axios, { type AxiosProgressEvent } from "axios";
import { chunk, isEmpty } from "lodash";
import { END, type EventChannel, eventChannel } from "redux-saga";
import {
  all,
  call,
  fork,
  put,
  take,
  takeEvery,
  select,
} from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getFileName } from "../../api/common";
import type { IActionTypeParam } from "../../api/model";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";
import { downloadFile } from "../hooks";
import {
  setFileDownloadStatus,
  setFileUploadStatus,
  setFolderDownloadStatus,
  setFolderUploadStatus,
} from "./actions";
import {
  type FileUploadObject,
  type FolderUploadObject,
  ICartActionTypes,
  type SelectionPayload,
  type UploadPayload,
} from "./types";

function* setStatus(
  type: string,
  id: number,
  step: "started" | "processing" | "finished" | "cancelled",
  fileName: string,
  error?: string,
  feed?: Feed,
) {
  if (type === "file") {
    yield put(setFileDownloadStatus({ id, step, fileName, error }));
  } else {
    yield put(setFolderDownloadStatus({ id, step, fileName, error, feed }));
  }
}

const isFileBrowserFolder = (payload: any): payload is FileBrowserFolder => {
  return (payload as FileBrowserFolder).data?.path !== undefined;
};

export async function createFeed(path: string[], feedName: string) {
  const client = ChrisAPIClient.getClient();
  const dircopy: Plugin | undefined = (await getPlugin("pl-dircopy")) as
    | Plugin
    | undefined;

  if (!dircopy) {
    throw new Error("pl-dircopy was not registered");
  }
  const createdInstance: PluginInstance = (await client.createPluginInstance(
    dircopy.data.id,
    //@ts-ignore
    { dir: path.length > 0 ? path.join(",") : path[0] },
  )) as PluginInstance;

  if (!createdInstance) {
    throw new Error("Failed to create an instance of pl-dircopy");
  }
  const feed = (await createdInstance.getFeed()) as Feed;
  if (!feed) {
    throw new Error("Failed to create a Feed");
  }
  await feed.put({ name: feedName });
  return { createdInstance, feed };
}

function* downloadFolder(
  payload: FileBrowserFolder | FileBrowserFolderFile,
  username: string,
  pipelineType: string,
) {
  const { id } = payload.data;
  const isFolder = isFileBrowserFolder(payload);
  const path = isFolder ? payload.data.path : payload.data.fname;
  const type = isFolder ? "folder" : "file";
  const folderNameForFeed = getFileName(path);
  const client = ChrisAPIClient.getClient();

  const pipelineName =
    pipelineType === "Download Pipeline"
      ? "zip v20240311"
      : "DICOM anonymization simple v20230926";

  const pipelineList: PipelineList = yield client.getPipelines({
    name: pipelineName,
  });

  if (!pipelineList || !pipelineList.data) {
    throw new Error(
      `Failed to find the pipeline. Is this '${pipelineName}' registered?`,
    );
  }
  yield setStatus(type, id, "processing", path);
  const pipelines = pipelineList.getItems() as unknown as Pipeline[];
  const currentPipeline = pipelines[0];
  try {
    const feedName =
      pipelineType === "Download Pipeline"
        ? `Library Download for ${folderNameForFeed}`
        : `Library Anonymize for ${folderNameForFeed}`;
    const { feed, createdInstance } = yield call(createFeed, [path], feedName);
    // Set Status
    yield setStatus(type, id, "processing", path, "", feed);
    // Add a workflow
    const workflow: Workflow = yield client.createWorkflow(
      currentPipeline.data.id,
      //@ts-ignore
      {
        previous_plugin_inst_id: createdInstance.data.id,
      },
    );

    if (!workflow) {
      throw new Error("Failed to create a workflow");
    }
    const pluginInstancesList: PluginInstanceList =
      yield workflow.getPluginInstances();
    const pluginInstances = pluginInstancesList.getItems() as PluginInstance[];
    if (pluginInstances.length > 0) {
      const zipInstance = pluginInstances[0];
      let filePath = "";
      if (pipelineType === "Download Pipeline") {
        filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
      } else {
        const headerEditInstance = pluginInstances[1];
        filePath = `home/${username}/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-dicom_headeredit_${headerEditInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
      }

      const statusResource: ItemResource = yield zipInstance.get();
      let status = statusResource.data.status;
      while (status !== "finishedSuccessfully") {
        yield new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
        const statusReq: ItemResource = yield zipInstance.get();
        status = statusReq.data.status;
        if (status === "finishedWithError" || status === "cancelled") {
          throw new Error("Download failed. Please try again...");
        }
      }
      if (status === "finishedSuccessfully") {
        const folderList: FileBrowserFolderFileList =
          yield client.getFileBrowserFolders({ path: filePath });
        if (!folderList) {
          throw new Error(
            `Failed to find the files under this path ${filePath}`,
          );
        }

        const folders = folderList.getItems();
        if (folders && folders.length > 0) {
          const folder = folders[0];
          const files: FileBrowserFolderFileList = yield folder.getFiles();
          const fileItems = files.getItems() as FileBrowserFolderFile[];
          if (!fileItems) {
            throw new Error("Failed to find the zip file");
          }
          const fileToZip = fileItems[0];
          yield downloadFile(fileToZip);
        } else {
          throw new Error(`Failed to find a folder for this path: ${filePath}`);
        }
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

function* handleIndividualDownload(
  path: SelectionPayload,
  username: string,
  pipelineType: string,
) {
  const { type, payload } = path;
  const { id } = payload.data;

  const pathForState = type === "file" ? payload.data.fname : payload.data.path;

  try {
    yield setStatus(type, id, "started", pathForState);
    if (type === "file" && pipelineType === "Download Pipeline") {
      yield downloadFile(payload as FileBrowserFolderFile);
    } else {
      yield downloadFolder(
        payload as FileBrowserFolder,
        username,
        pipelineType,
      );
    }
    yield setStatus(type, id, "finished", pathForState);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Uknown error";
    yield setStatus(type, id, "cancelled", pathForState, errMsg);
  }
}

function* handleDownload(action: IActionTypeParam) {
  const { paths, username } = action.payload;

  for (const path of paths) {
    yield fork(handleIndividualDownload, path, username, "Download Pipeline");
  }
}

function createUploadChannel(config: any) {
  return eventChannel((emitter) => {
    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.progress) {
        const progress = Math.round(progressEvent.progress * 100);
        emitter({ progress });
      }
    };

    const source = axios.CancelToken.source();

    const axiosConfig = {
      headers: config.headers,
      onUploadProgress,
      cancelToken: source.token,
      ...config,
    };

    const cancelHandler = () => {
      source.cancel("Operation canceled by the user.");
    };
    axiosConfig.signal.addEventListener("abort", cancelHandler);

    axios
      .post(config.url, config.data, axiosConfig)
      .then((response) => {
        const progress = 100;
        emitter({ progress, response });
        emitter(END);
      })
      .catch((error) => {
        let message = "Unexpected Error while uploading the file";

        if (axios.isCancel(error)) {
          emitter({ cancelled: true });
        } else if (axios.isAxiosError(error)) {
          message = !isEmpty(error.response?.data.upload_path)
            ? error.response?.data.upload_path[0]
            : error.message;
        }
        emitter({ error: message });
        emitter(END);
      });

    return () => {
      axiosConfig.signal.removeEventListener("abort", cancelHandler);
    };
  });
}

function* uploadFileBatch(
  client: Client,
  files: File[],
  currentPath: string,
  isFolder: boolean,
  batchSize: number,
) {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}userfiles/`;
  const batches = chunk(files, batchSize);
  const totalFiles = files.length;
  let uploadedFilesCount = 0;
  let cancelledUploads = false;
  let errorOccurred = false;
  let lastError = "";

  const folderController = new AbortController();
  for (const batch of batches) {
    yield all(
      batch.map((file) => {
        const formData = new FormData();
        const name = isFolder ? file.webkitRelativePath : file.name;
        const path = `${currentPath}/${name}`;

        formData.append("upload_path", path);
        formData.append("fname", file, name);

        const controller = new AbortController();
        const config = {
          headers: { Authorization: `Token ${client.auth.token}` },
          signal: isFolder ? folderController.signal : controller.signal,
          url,
          data: formData,
        };

        const uploadChannel: EventChannel<any> = createUploadChannel(config);

        return call(function* () {
          try {
            while (true) {
              const { progress, response, error, cancelled } =
                yield take(uploadChannel);

              if (cancelled) {
                cancelledUploads = true;
                yield put(
                  isFolder
                    ? setFolderUploadStatus({
                        step: errorOccurred
                          ? `Error: ${lastError}`
                          : "Upload Cancelled",
                        fileName: name.split("/")[0],
                        totalCount: totalFiles,
                        currentCount: uploadedFilesCount,
                        controller: null,
                        path: currentPath,
                        type: "folder",
                      })
                    : setFileUploadStatus({
                        step: errorOccurred
                          ? `Error: ${lastError}`
                          : "Upload Cancelled",
                        fileName: name,
                        progress: progress || 0,
                        controller: null,
                        path: currentPath,
                        type: "file",
                      }),
                );
                break;
              }

              if (error) {
                if (error.includes("Invalid path.")) {
                  errorOccurred = true;
                  lastError = error; // Store the last error message

                  // We need to cancel the folder upload manually since it will upload other files in the list.
                  // If it's an upload path error, all the files in the list are going to be errored so it's safe to cancel the entire upload.
                  isFolder && folderController.abort();
                  if (!isFolder) {
                    // No need to manually cancel the upload for a single file as the request will fail.
                    yield put(
                      setFileUploadStatus({
                        step: `Error: ${lastError}`,
                        fileName: name,
                        progress: progress || 0,
                        controller: null,
                        path: currentPath,
                        type: "file",
                      }),
                    );
                  }
                  break;
                }
              }

              if (progress !== undefined && !isFolder && !cancelled && !error) {
                yield put(
                  setFileUploadStatus({
                    step:
                      progress === 100 && response
                        ? "Upload Complete"
                        : "Uploading...",
                    fileName: name,
                    progress: progress,
                    controller,
                    path: currentPath,
                    type: "file",
                  }),
                );
              }

              if (response || error) {
                break;
              }
            }
          } finally {
            uploadChannel.close();
          }
        });
      }),
    );

    if (!cancelledUploads) {
      uploadedFilesCount += batch.length;

      if (isFolder) {
        const name = files[0].webkitRelativePath;
        const fileName = name.split("/")[0];
        yield put(
          setFolderUploadStatus({
            step:
              uploadedFilesCount === totalFiles
                ? "Upload Complete"
                : "Uploading...",
            fileName: fileName,
            totalCount: totalFiles,
            currentCount: uploadedFilesCount,
            controller: folderController,
            path: currentPath,
            type: "folder",
          }),
        );
      }
    }
  }
}

function* handleUpload(action: IActionTypeParam) {
  const { files, isFolder, currentPath }: UploadPayload = action.payload;
  const client = ChrisAPIClient.getClient();
  const batchSize = files.length > 500 ? 100 : 50; // Adjust the batch size as needed

  yield call(uploadFileBatch, client, files, currentPath, isFolder, batchSize);
}

function* handleAnonymize(action: IActionTypeParam) {
  const { paths, username } = action.payload;
  for (const path of paths) {
    yield fork(handleIndividualDownload, path, username, "Anonymize Pipeline");
  }
}

function* watchDownload() {
  yield takeEvery(ICartActionTypes.START_DOWNLOAD, handleDownload);
}

function* watchUpload() {
  yield takeEvery(ICartActionTypes.START_UPLOAD, handleUpload);
}

function* watchAnonymize() {
  yield takeEvery(ICartActionTypes.START_ANONYMIZE, handleAnonymize);
}

function* watchCancelUpload() {
  yield takeEvery(ICartActionTypes.CANCEL_UPLOAD, function* (action: any) {
    const { id: fileName, type } = action.payload;

    if (type === "folder") {
      const folderStatus: FolderUploadObject = yield select(
        (state) => state.cart.folderUploadStatus[fileName],
      );
      if (folderStatus?.controller) {
        folderStatus.controller.abort();
      }
    } else {
      const fileStatus: FileUploadObject = yield select(
        (state) => state.cart.fileUploadStatus[fileName],
      );
      if (fileStatus?.controller) {
        fileStatus.controller.abort();
      }
    }
  });
}

export function* cartSaga() {
  yield all([
    fork(watchDownload),
    fork(watchUpload),
    fork(watchAnonymize),
    fork(watchCancelUpload),
  ]);
}
