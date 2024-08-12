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
import { call, fork, put, takeEvery } from "redux-saga/effects";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getFileName } from "../../api/common";
import type { IActionTypeParam } from "../../api/model";
import { getPlugin } from "../../components/CreateFeed/createFeedHelper";
import { downloadFile } from "../hooks";
import { setFileDownloadStatus, setFolderDownloadStatus } from "./actions";
import { ICartActionTypes, type SelectionPayload } from "./types";

export function* setStatus(
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
    yield call(setStatus, type, id, "started", pathForState);
    if (type === "file" && pipelineType === "Download Pipeline") {
      yield call(downloadFile, payload as FileBrowserFolderFile);
    } else {
      yield call(downloadFolder, payload, username, pipelineType);
    }
    yield call(setStatus, type, id, "finished", pathForState);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    yield call(setStatus, type, id, "cancelled", pathForState, errMsg);
  }
}

function* handleDownload(action: IActionTypeParam) {
  const { paths, username } = action.payload;
  for (const path of paths) {
    yield fork(handleIndividualDownload, path, username, "Download Pipeline");
  }
}

function* handleAnonymize(action: IActionTypeParam) {
  const { paths, username } = action.payload;
  for (const path of paths) {
    yield fork(handleIndividualDownload, path, username, "Anonymize Pipeline");
  }
}

export function* watchAnonymize() {
  yield takeEvery(ICartActionTypes.START_ANONYMIZE, handleAnonymize);
}

export function* watchDownload() {
  yield takeEvery(ICartActionTypes.START_DOWNLOAD, handleDownload);
}
