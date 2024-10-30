import type Client from "@fnndsc/chrisapi";
import axios, { type AxiosProgressEvent } from "axios";
import { chunk, isEmpty } from "lodash";
import { END, type EventChannel, eventChannel } from "redux-saga";
import { all, call, put, select, take, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { IActionTypeParam } from "../../api/model";
import {
  cancelUpload,
  setFileUploadStatus,
  setFolderUploadStatus,
  startUpload,
} from "./cartSlice";
import { createFeed } from "./downloadSaga";
import type {
  FileUploadObject,
  FolderUploadObject,
  UploadPayload,
} from "./types";

function createUploadChannel(config: any) {
  return eventChannel((emitter) => {
    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.progress) {
        const { loaded, total } = progressEvent;
        const progress = Math.round(progressEvent.progress * 100);
        emitter({ progress, loaded, total });
      }
    };

    const source = axios.CancelToken.source();
    const axiosConfig = {
      ...config,
      cancelToken: source.token,
      onUploadProgress,
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
  invalidateFunc: () => void,
  shouldCreateFeed?: boolean,
  nameForFeed?: string,
) {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}userfiles/`;
  const firstBatch = files.slice(0, 1); // First batch with 1 file
  const remainingBatches = chunk(files.slice(1), batchSize); // Remaining batches
  const batches = [firstBatch, ...remainingBatches];
  const totalFiles = files.length;
  let uploadedFilesCount = 0;
  let uploadFileCountForFeed = 0;
  let cancelledUploads = false;
  let errorOccurred = false;
  let lastError = "";

  const folderController = new AbortController();
  // Immediately set a status to indicate that the upload has started
  if (isFolder) {
    // Immediately show the upload status for folders, as calculating the status for batched uploads may take time,
    // and the UI won't provide any notification during that period.
    yield call(
      setInitialFolderUploadStatus,
      files[0],
      totalFiles,
      currentPath,
      folderController,
    );
  }
  for (const batch of batches) {
    yield all(
      batch.map((file) => {
        const { formData, name, controller } = prepareUploadData(
          file,
          currentPath,
          isFolder,
          folderController,
        );
        const config = createUploadConfig(client, url, formData, controller);
        const uploadChannel: EventChannel<any> = createUploadChannel(config);
        return call(function* () {
          try {
            while (true) {
              const { progress, loaded, total, response, error, cancelled } =
                yield take(uploadChannel);

              if (cancelled) {
                cancelledUploads = true;
                yield call(
                  handleUploadError,
                  isFolder,
                  name,
                  currentPath,
                  errorOccurred,
                  lastError,
                );
                break;
              }

              if (error) {
                if (error.includes("Invalid path.")) {
                  errorOccurred = true;
                  lastError = error; // Store the last error message

                  // We need to cancel the folder upload manually since it will upload other files in the list and they will all error out due to the path being an invalid path
                  isFolder && folderController.abort();
                }
                if (!isFolder) {
                  // No need to manually cancel the upload for a single file as the request will fail.
                  yield call(
                    handleUploadError,
                    isFolder,
                    name,
                    currentPath,
                    true,
                    error,
                  );
                }
                break;
              }

              if (progress !== undefined && !isFolder && !cancelled && !error) {
                yield call(
                  updateFileUploadStatus,
                  name,
                  progress,
                  loaded,
                  total,
                  response,
                  currentPath,
                  controller,
                  invalidateFunc,
                  shouldCreateFeed,
                );
              }

              if (response && !error) {
                uploadFileCountForFeed += 1;
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
        yield call(
          updateFolderUploadStatus,
          files[0],
          totalFiles,
          uploadedFilesCount,
          currentPath,
          folderController,
          invalidateFunc,
          shouldCreateFeed,
          nameForFeed,
        );
      }
    }

    if (
      !isFolder &&
      shouldCreateFeed &&
      uploadFileCountForFeed === files.length
    ) {
      // This creates a feed for multiple file uploads
      try {
        yield call(
          createFeed,
          [currentPath],
          nameForFeed ? nameForFeed : "",
          invalidateFunc,
        );
      } catch (e) {
        yield put(
          setFileUploadStatus({
            step: "Error: Failed to create a feed",
            fileName: nameForFeed as string,
            progress: 0,
            loaded: 0,
            total: 0,
            controller: null,
            path: currentPath,
            type: "file",
          }),
        );
      }
    }
  }
}

function* handleUpload(action: IActionTypeParam) {
  const {
    files,
    isFolder,
    currentPath,
    createFeed,
    invalidateFunc,
    nameForFeed,
  }: UploadPayload = action.payload;
  const client = ChrisAPIClient.getClient();
  const batchSize = files.length > 500 ? 100 : 50; // Adjust the batch size as needed

  yield call(
    uploadFileBatch,
    client,
    files,
    currentPath,
    isFolder,
    batchSize,
    invalidateFunc,
    createFeed,
    nameForFeed,
  );
}

export function* watchUpload() {
  yield takeEvery(startUpload.type, handleUpload);
}

export function* watchCancelUpload() {
  yield takeEvery(cancelUpload.type, function* (action: any) {
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

/***************************************************************** */
/** Utility Functions for upload files and folders with redux saga  */
/***************************************************************** */

function* setInitialFolderUploadStatus(
  file: File,
  totalFiles: number,
  currentPath: string,
  controller: AbortController,
) {
  const name = file.webkitRelativePath;
  const fileName = name.split("/")[0];
  yield put(
    setFolderUploadStatus({
      step: "Upload Started",
      fileName,
      totalCount: totalFiles,
      currentCount: 0,
      controller,
      path: currentPath,
      type: "folder",
    }),
  );
}

function* handleUploadError(
  isFolder: boolean,
  name: string,
  currentPath: string,
  cancelledDueToError: boolean,
  error_message: string,
) {
  const step = cancelledDueToError
    ? `Error: ${error_message}`
    : "Upload Cancelled";
  const action = isFolder
    ? setFolderUploadStatus({
        step,
        fileName: name.split("/")[0],
        totalCount: 0,
        currentCount: 0,
        controller: null,
        path: currentPath,
        type: "folder",
      })
    : setFileUploadStatus({
        step,
        fileName: name,
        progress: 0,
        loaded: 0,
        total: 0,
        controller: null,
        path: currentPath,
        type: "file",
      });
  yield put(action);
}

function* updateFileUploadStatus(
  name: string,
  progress: number,
  loaded: number,
  total: number,
  response: any,
  currentPath: string,
  controller: AbortController,
  invalidateFunc: () => void,
  shouldCreateFeed?: boolean,
) {
  const isDone = progress === 100;

  const step =
    isDone && !response
      ? "Server Processing..."
      : isDone && response
        ? "Upload Complete"
        : "Uploading...";

  // Invalidate the ui page if the file upload is complete
  isDone && !shouldCreateFeed && invalidateFunc();
  yield put(
    setFileUploadStatus({
      step,
      fileName: name,
      progress,
      loaded,
      total,
      controller,
      path: currentPath,
      type: "file",
    }),
  );
}

function* updateFolderUploadStatus(
  file: File,
  totalFiles: number,
  uploadedFilesCount: number,
  currentPath: string,
  controller: AbortController,
  invalidateFunc: () => void,
  shouldCreateFeed?: boolean,
  nameForFeed?: string,
) {
  const name = file.webkitRelativePath;
  const fileName = name.split("/")[0];
  const uploadDone = uploadedFilesCount === totalFiles;
  try {
    if (uploadDone && shouldCreateFeed) {
      yield call(
        createFeed,
        [`${currentPath}/${fileName}`],
        nameForFeed as string,
        invalidateFunc,
      );
    }
    //invalidate the ui page if the upload is complete
    yield put(
      setFolderUploadStatus({
        step: uploadDone ? "Upload Complete" : "Uploading...",
        fileName,
        totalCount: totalFiles,
        currentCount: uploadedFilesCount,
        controller,
        path: currentPath,
        type: "folder",
      }),
    );
    uploadDone && !shouldCreateFeed && invalidateFunc();
  } catch (e) {
    yield put(
      setFolderUploadStatus({
        step: "Error: Failed to create a feed",
        fileName,
        totalCount: totalFiles,
        currentCount: uploadedFilesCount,
        controller: null,
        path: currentPath,
        type: "folder",
      }),
    );
  }
}

function prepareUploadData(
  file: File,
  currentPath: string,
  isFolder: boolean,
  folderController: AbortController,
) {
  const formData = new FormData();
  const name = isFolder ? file.webkitRelativePath : file.name;
  const path = `${currentPath}/${name}`;
  formData.append("upload_path", path);
  formData.append("fname", file, name);
  const controller = isFolder ? folderController : new AbortController();
  return { formData, name, path, controller };
}

function createUploadConfig(
  client: Client,
  url: string,
  formData: FormData,
  controller: AbortController,
) {
  return {
    headers: { Authorization: `Token ${client.auth.token}` },
    signal: controller.signal,
    url,
    data: formData,
  };
}
