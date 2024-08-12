import type Client from "@fnndsc/chrisapi";
import axios, { type AxiosProgressEvent } from "axios";
import { chunk, isEmpty } from "lodash";
import { END, type EventChannel, eventChannel } from "redux-saga";
import { all, call, put, select, take, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { IActionTypeParam } from "../../api/model";
import { setFileUploadStatus, setFolderUploadStatus } from "./actions";
import {
  type FileUploadObject,
  type FolderUploadObject,
  ICartActionTypes,
  type UploadPayload,
} from "./types";

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
  const firstBatch = files.slice(0, 1); // First batch with 1 file
  const remainingBatches = chunk(files.slice(1), batchSize); // Remaining batches
  const batches = [firstBatch, ...remainingBatches];
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

                  // We need to cancel the folder upload manually since it will upload other files in the list and they will all error out due to the path being invalid path
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

export function* watchUpload() {
  yield takeEvery(ICartActionTypes.START_UPLOAD, handleUpload);
}

export function* watchCancelUpload() {
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
