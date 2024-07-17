import axios, { type AxiosProgressEvent } from "axios";

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
} from "@fnndsc/chrisapi";
import { call, all, fork, put, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { IActionTypeParam } from "../../api/model";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";
import { downloadFile } from "../hooks";
import {
  setFileDownloadStatus,
  setFileUploadStatus,
  setFolderDownloadStatus,
  setFolderUploadStatus,
} from "./actionts";
import {
  ICartActionTypes,
  type SelectionPayload,
  type UploadPayload,
} from "./types";

function* setStatus(
  type: string,
  id: number,
  step: "started" | "processing" | "finished" | "cancelled",
) {
  if (type === "file") {
    yield put(setFileDownloadStatus({ id, step }));
  } else {
    yield put(setFolderDownloadStatus({ id, step }));
  }
}

function* downloadFolder(payload: FileBrowserFolder) {
  const { id } = payload.data;
  const path = payload.data.path;
  const client = ChrisAPIClient.getClient();

  // Check if pipeline exists
  const pipelineList: PipelineList = yield client.getPipelines({
    name: "zip v20240311",
  });

  if (!pipelineList || !pipelineList.data) {
    throw new Error("Failed to find the pipeline");
  }

  yield setStatus("folder", id, "processing");

  const pipelines = pipelineList.getItems() as unknown as Pipeline[];
  const currentPipeline = pipelines[0];

  const dircopy: Plugin | undefined = yield getPlugin("pl-dircopy") as Promise<
    Plugin | undefined
  >;

  if (!dircopy) {
    throw new Error("pl-dircopy was not registered");
  }

  const createdInstance: PluginInstance = yield client.createPluginInstance(
    dircopy.data.id,
    {
      //@ts-ignore
      dir: path,
    },
  ) as Promise<PluginInstance>;

  if (!createdInstance) {
    throw new Error("Failed to create an instance of pl-dircopy");
  }

  const feed = (yield createdInstance.getFeed()) as Feed;

  if (!feed) {
    throw new Error("Failed to create a Feed");
  }

  yield feed.put({
    name: "Library Download",
  });

  //@ts-ignore
  const workflow = yield client.createWorkflow(currentPipeline.data.id, {
    previous_plugin_inst_id: createdInstance.data.id,
  });

  if (!workflow) {
    throw new Error("Failed to create a workflow");
  }

  const pluginInstancesList: PluginInstanceList =
    yield workflow.getPluginInstances();

  const pluginInstances = pluginInstancesList.getItems() as PluginInstance[];
  if (pluginInstances.length > 0) {
    const zipInstance = pluginInstances[0];
    const filePath = `home/chris/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
    const statusResource: ItemResource = yield zipInstance.get();
    let status = statusResource.data.status;

    while (status !== "finishedSuccessfully") {
      yield new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
      const statusReq: ItemResource = yield zipInstance.get();
      status = statusReq.data.status;
    }

    if (status === "finishedSuccessfully") {
      const folderList: FileBrowserFolderFileList =
        yield client.getFileBrowserFolders({
          path: filePath,
        });

      if (!folderList) {
        throw new Error(`Failed to find the files under this path ${filePath}`);
      }

      const folders = folderList.getItems();

      if (folders) {
        const folder = folders[0];
        const files: FileBrowserFolderFileList = yield folder.getFiles();
        const fileItems = files.getItems() as FileBrowserFolderFile[];
        if (!fileItems) {
          throw new Error("Failed to find the zip file");
        }
        const fileToZip = fileItems[0];
        yield downloadFile(fileToZip);
      }
    }
  }
}

function* handleIndividualDownload(path: SelectionPayload) {
  const { type, payload } = path;
  const { id } = payload.data;

  try {
    yield setStatus(type, id, "started");
    if (type === "file") {
      yield downloadFile(payload as FileBrowserFolderFile);
    } else if (type === "folder") {
      yield downloadFolder(payload as FileBrowserFolder);
    }
    yield setStatus(type, id, "finished");
  } catch (e) {
    yield setStatus(type, id, "cancelled");
  }
}

function* handleDownload(action: IActionTypeParam) {
  const paths = action.payload;

  for (const path of paths) {
    yield fork(handleIndividualDownload, path);
  }
}

function createUploadConfig(
  client: any,
  file: File,
  currentPath: string,
  isFolder: boolean,
  controller: AbortController,
) {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}userfiles/`;
  const formData = new FormData();
  const name = isFolder ? file.webkitRelativePath : file.name;
  formData.append("upload_path", `${currentPath}/${name}`);
  formData.append("fname", file, file.name);

  return {
    headers: { Authorization: `Token ${client.auth.token}` },
    signal: controller.signal,
    url,
    data: formData,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      console.log("ProgressEvent", progressEvent);
      if (progressEvent?.progress) {
        const progress = Math.round(progressEvent.progress * 100);
        if (!isFolder) {
          // Dispatch action to set file upload status
          put(
            setFileUploadStatus({
              step: "Uploading",
              fileName: file.name,
              progress,
              controller,
            }),
          );

          if (progress === 100) {
            put(
              setFileUploadStatus({
                step: "Upload Complete",
                fileName: file.name,
                progress,
                controller,
              }),
            );
          }
        } else {
          if (progress === 100) {
            // Update folder upload status
            put(
              setFolderUploadStatus({
                step: "Uploading",
                fileName: name.split("/")[0],
                totalCount: 1,
                currentCount: 1,
                controller,
              }),
            );

            put(
              setFolderUploadStatus({
                step: "Upload Complete",
                fileName: name.split("/")[0],
                totalCount: 1,
                currentCount: 1,
                controller,
              }),
            );
          }
        }
      }
    },
  };
}

function* handleUpload(action: { payload: UploadPayload }) {
  const { files, isFolder, currentPath } = action.payload;
  const client = ChrisAPIClient.getClient();

  try {
    yield all(
      files.map((file) => {
        const controller = new AbortController();
        const config = createUploadConfig(
          client,
          file,
          currentPath,
          isFolder,
          controller,
        );

        return call(axios.post, config.url, config.data, config);
      }),
    );
  } catch (error) {
    console.error("Error uploading files:", error);
  }
}

export default handleUpload;

function* watchDownload() {
  yield takeEvery(ICartActionTypes.START_DOWNLOAD, handleDownload);
}

function* watchUpload() {
  yield takeEvery(ICartActionTypes.START_UPLOAD, handleUpload);
}

export function* cartSaga() {
  yield all([fork(watchDownload), fork(watchUpload)]);
}
