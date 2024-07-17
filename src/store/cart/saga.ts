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
import { all, fork, put, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import type { IActionTypeParam } from "../../api/model";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";
import { downloadFile } from "../hooks";
import { setFileDownloadStatus, setFolderDownloadStatus } from "./actionts";
import { ICartActionTypes, type SelectionPayload } from "./types";

function* downloadFolder(payload: FileBrowserFolder) {
  const path = payload.data.path;
  const client = ChrisAPIClient.getClient();

  //Check if pipeline exists

  const pipelineList: PipelineList = yield client.getPipelines({
    name: "zip v20240311",
  });

  if (!pipelineList || !pipelineList.data) {
    throw new Error("Failed to find the pipeline");
  }

  yield put(setFileDownloadStatus("processing"));
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

  if (type === "file") {
    try {
      yield put(setFileDownloadStatus("started"));
      yield downloadFile(payload as FileBrowserFolderFile);
      yield put(setFileDownloadStatus("finished"));
    } catch (e) {
      yield put(setFileDownloadStatus("cancelled"));
    }
  }
  if (type === "folder") {
    try {
      yield put(setFolderDownloadStatus("started"));
      yield downloadFolder(payload as FileBrowserFolder);
      yield put(setFolderDownloadStatus("finished"));
    } catch (e) {
      yield put(setFolderDownloadStatus("cancelled"));
    }
  }
}

function* handleDownload(action: IActionTypeParam) {
  const paths = action.payload;

  for (const path of paths) {
    yield fork(handleIndividualDownload, path);
  }
}

function* watchDownload() {
  yield takeEvery(ICartActionTypes.START_DOWNLOAD, handleDownload);
}

export function* cartSaga() {
  yield all([fork(watchDownload)]);
}
