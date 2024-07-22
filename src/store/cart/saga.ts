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
  UserFile,
  UserFileList,
  Workflow,
} from "@fnndsc/chrisapi";
import type Client from "@fnndsc/chrisapi";
import axios, { type AxiosProgressEvent } from "axios";
import { END, type EventChannel, eventChannel } from "redux-saga";
import { all, call, fork, put, take, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { IActionTypeParam } from "../../api/model";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";
import { downloadFile } from "../hooks";
import {
  setBulkSelectPaths,
  setFileDownloadStatus,
  setFileUploadStatus,
  setFolderDownloadStatus,
  setFolderUploadStatus,
} from "./actions";
import {
  type FileUpload,
  type FolderUpload,
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

function* downloadFolder(payload: FileBrowserFolder, pipelineType: string) {
  const { id } = payload.data;
  const path = payload.data.path;
  const client = ChrisAPIClient.getClient();

  const pipelineName =
    pipelineType === "Download Pipeline"
      ? "zip v20240311"
      : "DICOM anonymization simple v20230926";

  const pipelineList: PipelineList = yield client.getPipelines({
    name: pipelineName,
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
    //@ts-ignore
    { dir: path },
  ) as Promise<PluginInstance>;

  if (!createdInstance) {
    throw new Error("Failed to create an instance of pl-dircopy");
  }

  const feed = (yield createdInstance.getFeed()) as Feed;

  if (!feed) {
    throw new Error("Failed to create a Feed");
  }

  const feedName =
    pipelineType === "Download Pipeline"
      ? "Library Download"
      : "Library Anonymize";

  yield feed.put({ name: feedName });

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
      filePath = `home/chris/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
    } else {
      const headerEditInstance = pluginInstances[1];
      filePath = `home/chris/feeds/feed_${feed.data.id}/pl-dircopy_${createdInstance.data.id}/pl-dicom_headeredit_${headerEditInstance.data.id}/pl-pfdorun_${zipInstance.data.id}/data`;
    }

    const statusResource: ItemResource = yield zipInstance.get();
    let status = statusResource.data.status;

    while (status !== "finishedSuccessfully") {
      yield new Promise((resolve) => setTimeout(resolve, 5000)); // Polling every 5 seconds
      const statusReq: ItemResource = yield zipInstance.get();
      status = statusReq.data.status;
    }

    if (status === "finishedSuccessfully") {
      const folderList: FileBrowserFolderFileList =
        yield client.getFileBrowserFolders({ path: filePath });

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

function* handleIndividualDownload(
  path: SelectionPayload,
  pipelineType: string,
) {
  const { type, payload } = path;
  const { id } = payload.data;

  try {
    yield setStatus(type, id, "started");
    if (type === "file") {
      yield downloadFile(payload as FileBrowserFolderFile);
    } else if (type === "folder") {
      yield downloadFolder(payload as FileBrowserFolder, pipelineType);
    }
    yield setStatus(type, id, "finished");
  } catch (e) {
    console.error(e);
    yield setStatus(type, id, "cancelled");
  }
}

function* handleDownload(action: IActionTypeParam) {
  const paths = action.payload;

  for (const path of paths) {
    yield fork(handleIndividualDownload, path, "Download Pipeline");
  }
}

function* handleAnonymizationPayload(paths: SelectionPayload[]) {
  for (const path of paths) {
    yield fork(handleIndividualDownload, path, "Anonymization Pipeline");
  }
}

function createUploadChannel(config: any) {
  return eventChannel((emitter) => {
    const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
      //@ts-ignore
      const progress = Math.round(progressEvent.progress * 100);
      emitter({ progress });
    };

    const axiosConfig = {
      headers: config.headers,
      signal: config.signal,
      onUploadProgress,
    };

    axios
      .post(config.url, config.data, axiosConfig)
      .then((response) => {
        // Assuming that data is created
        const progress = 100;
        emitter({ response, progress });
        emitter(END);
      })
      .catch((error) => {
        emitter({ error });
        emitter(END);
      });

    return () => {};
  });
}

const count: { [key: string]: number } = {};

function* uploadFile(
  client: Client,
  file: File,
  files: File[],
  currentPath: string,
  isFolder: boolean,
  controller: AbortController,
) {
  const url = `${import.meta.env.VITE_CHRIS_UI_URL}userfiles/`;
  const formData = new FormData();
  const name = isFolder ? file.webkitRelativePath : file.name;
  const path = `${currentPath}/${name}`;
  formData.append("upload_path", path);
  formData.append("fname", file, file.name);

  const fileName = name.split("/")[0];
  const folderPath = `${currentPath}/${fileName}`;

  const config = {
    headers: { Authorization: `Token ${client.auth.token}` },
    signal: controller.signal,
    url,
    data: formData,
  };

  const uploadChannel: EventChannel<any> = yield call(
    createUploadChannel,
    config,
  );
  try {
    while (true) {
      const { progress, response, error } = yield take(uploadChannel);

      if (progress !== undefined) {
        if (!isFolder) {
          yield put(
            setFileUploadStatus({
              step: progress === 100 ? "Upload Complete" : "Uploading",
              fileName: file.name,
              progress,
              controller,
              path,
              type: "file",
            }),
          );
        } else {
          count[fileName] = count[fileName] ? count[fileName] + 1 : 1;
          yield put(
            setFolderUploadStatus({
              step:
                progress === 100 && count[fileName] === files.length
                  ? "Upload Complete"
                  : "Uploading",
              fileName,
              totalCount: files.length,
              currentCount: count[fileName],
              controller,
              path: folderPath,
              type: "folder",
            }),
          );

          if (progress === 100 && count[fileName] === files.length) {
            delete count[fileName];
          }
        }
      }

      if (response) {
        // Handle successful response if needed
        break;
      }

      if (error) {
        // Handle error if needed
        delete count[fileName];
        throw new Error(`Error uploading file: ${file.name}`);
      }
    }
  } finally {
    uploadChannel.close();
  }
}

function* handleUpload(action: IActionTypeParam) {
  const { files, isFolder, currentPath }: UploadPayload = action.payload;
  const client = ChrisAPIClient.getClient();

  try {
    yield all(
      files.map((file: File) => {
        const controller = new AbortController();
        return call(
          uploadFile,
          client,
          file,
          files,
          currentPath,
          isFolder,
          controller,
        );
      }),
    );
  } catch (error) {
    console.error("Error uploading files:", error);
  }
}

function* handleAnonymize(action: IActionTypeParam) {
  const {
    fileUpload,
    folderUpload,
  }: { fileUpload: FileUpload; folderUpload: FolderUpload } = action.payload;

  const client = ChrisAPIClient.getClient();

  const filePaths = Object.entries(fileUpload).map(([_name, status]) => ({
    type: status.type,
    path: status.path,
  }));

  const folderPaths = Object.entries(folderUpload).map(([_name, status]) => ({
    type: status.type,
    path: status.path,
  }));

  const createFileSelectionPayload: {
    payload: UserFile;
    type: string;
    path: string;
  }[] = yield all(
    filePaths.map(async (file) => {
      const userFileList: UserFileList = await client.getUserFiles({
        fname_exact: file.path,
        limit: 1,
      });

      const userFiles = userFileList.getItems() as UserFile[];

      return {
        payload: userFiles[0],
        type: file.type,
        path: file.path,
      };
    }),
  );

  const createFolderSelectionPayload: {
    payload: FileBrowserFolder | FileBrowserFolderFile;
    type: string;
    path: string;
  }[] = yield all(
    folderPaths.map(async (folder) => {
      const folderToAnon: FileBrowserFolder =
        (await client.getFileBrowserFolderByPath(
          folder.path,
        )) as FileBrowserFolder;

      return {
        payload: folderToAnon,
        type: folder.type,
        path: folderToAnon.data.path,
      };
    }),
  );

  yield put(setBulkSelectPaths(createFolderSelectionPayload));
  yield put(setBulkSelectPaths(createFileSelectionPayload));
  yield call(handleAnonymizationPayload, [
    ...createFileSelectionPayload,
    ...createFolderSelectionPayload,
  ]);
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

export function* cartSaga() {
  yield all([fork(watchDownload), fork(watchUpload), fork(watchAnonymize)]);
}
