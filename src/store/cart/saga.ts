import type {
  FileBrowserFolderFile,
  FileBrowserFolder,
  PipelineList,
  Pipeline,
  Feed,
  Plugin,
  PluginInstance,
} from "@fnndsc/chrisapi";
import { all, fork, put, takeEvery } from "redux-saga/effects";
import type { IActionTypeParam } from "../../api/model";
import { downloadFile } from "../hooks";
import { setFileDownloadStatus, setFolderDownloadStatus } from "./actionts";
import { ICartActionTypes, type SelectionPayload } from "./types";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";

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
