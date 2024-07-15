import type {
  PluginInstance,
  FileBrowserFolderFile,
  FileBrowserFolderLinkFile,
} from "@fnndsc/chrisapi";
import { all, delay, fork, put, takeEvery } from "@redux-saga/core/effects";
import { inflate, inflateRaw } from "pako";
import type { Task } from "redux-saga";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import type { IActionTypeParam } from "../../api/model";
import { PluginInstanceTypes } from "../pluginInstance/types";
import {
  getPluginFilesError,
  getPluginFilesSuccess,
  getPluginInstanceResourceSuccess,
  getPluginInstanceStatusSuccess,
  stopFetchingPluginResources,
  stopFetchingStatusResources,
} from "./actions";
import {
  type FetchFileResult,
  type PluginStatusLabels,
  ResourceTypes,
} from "./types";

export const fetchFilesFromAPath = async (
  path: string,
): Promise<FetchFileResult> => {
  const client = ChrisAPIClient.getClient();
  const foldersList = await client.getFileBrowserFolders({
    path,
  });

  const folders = foldersList.getItems();

  if (folders) {
    const folder = folders[0];
    if (folder) {
      const pagination = { limit: 100, offset: 0 };
      const fetchChildren = folder.getChildren;
      const boundChildren = fetchChildren.bind(folder);
      const { resource: children } = await fetchResource(
        pagination,
        boundChildren,
      );
      const linkFilesFn = folder.getLinkFiles;
      const boundLinkFilesFn = linkFilesFn.bind(folder);
      const { resource: linkFiles } =
        await fetchResource<FileBrowserFolderLinkFile>(
          pagination,
          boundLinkFilesFn,
        );
      const filesFn = folder.getFiles;
      const boundFilesFn = filesFn.bind(folder);
      const { resource: folderFiles } =
        await fetchResource<FileBrowserFolderFile>(pagination, boundFilesFn);

      return {
        folderFiles: folderFiles,
        linkFiles: linkFiles,
        children: children,
      };
    }
  }

  return {
    folderFiles: [],
    linkFiles: [],
    children: [],
  };
};

function* fetchPluginFiles(action: IActionTypeParam) {
  const { id, path } = action.payload;

  try {
    const { folderFiles, linkFiles, children }: FetchFileResult =
      yield fetchFilesFromAPath(path);

    const payload = {
      id,
      folderFiles,
      linkFiles,
      children,
      path,
    };
    yield put(getPluginFilesSuccess(payload));
  } catch (error) {
    const payload = {
      id,
      error,
    };
    yield put(getPluginFilesError(payload));
  }
}

function* handleGetPluginStatus(instance: PluginInstance) {
  while (true) {
    try {
      //@ts-ignore
      const pluginDetails = yield instance.get();
      //@ts-ignore

      const pluginStatus = pluginDetails.data.summary;
      const status = pluginDetails.data.status;

      const previousInstanceId = instance.data.previous_id;
      let previousStatus = "";

      if (previousInstanceId) {
        const previousInstance: PluginInstance =
          yield ChrisAPIClient.getClient().getPluginInstance(
            previousInstanceId,
          );
        previousStatus = previousInstance.data.status;
      }

      let parsedStatus: PluginStatusLabels | undefined = undefined;
      if (pluginStatus) {
        parsedStatus = JSON.parse(pluginStatus);
      }

      let output = {};
      if (pluginDetails.data.raw.length > 0) {
        output = getLog(pluginDetails.data.raw);
      }

      const payload = {
        id: pluginDetails.data.id,
        pluginStatus: parsedStatus,
        pluginLog: output,
        pluginDetails: pluginDetails,
        previousStatus,
      };

      yield put(getPluginInstanceResourceSuccess(payload));
      if (
        status === "cancelled" ||
        status === "finishedSuccessfully" ||
        status === "finishedWithError"
      ) {
        yield put(stopFetchingPluginResources(instance.data.id));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingPluginResources(instance.data.id));
    }
  }
}

function* handleGetInstanceStatus(instance: PluginInstance) {
  while (true) {
    try {
      //@ts-ignore
      const pluginDetails = yield instance.get();
      yield put(
        getPluginInstanceStatusSuccess({
          selected: instance,
          status: instance.data.status,
        }),
      );
      if (
        pluginDetails.data.status === "finishedWithError" ||
        pluginDetails.data.status === "cancelled" ||
        pluginDetails.data.status === "finishedSuccessfully"
      ) {
        yield put(stopFetchingStatusResources(instance.data.id));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingStatusResources(instance.data.id));
    }
  }
}

function* handleResetActiveResources(action: IActionTypeParam) {
  const pluginInstances = action.payload.data;
  const selectedPlugin = action.payload.selectedPlugin;
  yield put(stopFetchingPluginResources(selectedPlugin.data.id));
  for (let i = 0; i < pluginInstances.length; i++) {
    yield put(stopFetchingStatusResources(pluginInstances[i].data.id));
  }
}

type PollTask = {
  [id: number]: Task;
};

function cancelPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function cancelStatusPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function* watchCancelPoll(pollTask: Task) {
  yield takeEvery(ResourceTypes.STOP_FETCHING_PLUGIN_RESOURCES, () => {
    cancelPolling(pollTask);
  });
}

function* watchStatusCancelPoll(pollTask: PollTask) {
  yield takeEvery(
    ResourceTypes.STOP_FETCHING_STATUS_RESOURCES,
    (action: IActionTypeParam) => {
      const id = action.payload;
      const taskToCancel = pollTask[id];
      cancelStatusPolling(taskToCancel);
    },
  );
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  const instance = action.payload;

  const task: Task = yield fork(handleGetPluginStatus, instance);
  yield watchCancelPoll(task);
}

function* pollInstanceEndpoints(action: IActionTypeParam) {
  const pluginInstances = action.payload.pluginInstances;

  const pollTask: {
    [id: number]: Task;
  } = {};

  for (let i = 0; i < pluginInstances.length; i++) {
    const instance = pluginInstances[i];

    const task: Task = yield fork(handleGetInstanceStatus, instance);
    pollTask[instance.data.id] = task;
  }

  yield watchStatusCancelPoll(pollTask);
}

function* watchGetPluginFilesRequest() {
  yield takeEvery(ResourceTypes.GET_PLUGIN_FILES_REQUEST, fetchPluginFiles);
}

function* watchGetPluginStatusRequest() {
  yield takeEvery(
    ResourceTypes.GET_PLUGIN_STATUS_REQUEST,
    pollInstanceEndpoints,
  );
}

function* watchResetActiveResources() {
  yield takeEvery(
    ResourceTypes.RESET_ACTIVE_RESOURCES,
    handleResetActiveResources,
  );
}

function* watchSelectedPlugin() {
  yield takeEvery(
    PluginInstanceTypes.GET_SELECTED_PLUGIN,
    pollorCancelEndpoints,
  );
}

export function* resourceSaga() {
  yield all([
    fork(watchGetPluginFilesRequest),
    fork(watchGetPluginStatusRequest),
    fork(watchResetActiveResources),
    fork(watchSelectedPlugin),
  ]);
}

function getLog(raw: string) {
  // Step 1: Decode base64
  const strData = atob(raw);

  // Try inflating with "deflate" method
  try {
    const inflatedData = inflate(strData, { to: "string" });
    return JSON.parse(inflatedData);
  } catch (error1) {
    console.error("Error inflating with deflate:", error1);

    // If "deflate" fails, try "zlib" method
    try {
      const inflatedData = inflateRaw(strData, { to: "string" });
      return JSON.parse(inflatedData);
    } catch (error2) {
      console.error("Error inflating with zlib:", error2);
    }
  }

  // If both "deflate" and "zlib" fail, you may need to handle other compression methods here.

  console.error("Unable to inflate the data.");
  return null;
}
