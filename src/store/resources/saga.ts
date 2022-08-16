import { all, fork, takeEvery, put, delay } from "@redux-saga/core/effects";
import { Task } from "redux-saga";
import { IActionTypeParam } from "../../api/models/base.model";
import { ResourceTypes, PluginStatusLabels } from "./types";
import { PluginInstanceTypes } from "../pluginInstance/types";
import {
  FileBrowserPathFileList,
  PluginInstance,
  FileBrowserPath,
} from "@fnndsc/chrisapi";
import { inflate } from "pako";
import {
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  stopFetchingStatusResources,
  getPluginFilesSuccess,
  getPluginFilesError,
  getPluginInstanceStatusSuccess,
} from "./actions";
import { fetchResource } from "../../utils";
import ChrisAPIClient from "../../api/chrisapiclient";

export function* getPluginFiles(plugin: PluginInstance) {
  const params = { limit: 200, offset: 0 };
  const fn = plugin.getFiles;
  const boundFn = fn.bind(plugin);
  const files: any[] = yield fetchResource<any>(params, boundFn);
  return files;
}

export const fetchFilesFromAPath = async (path: string) => {
  const client = ChrisAPIClient.getClient();
  const foldersList: FileBrowserPathFileList = await client.getFileBrowserPaths(
    {
      path,
    }
  );
  let folders: string[] = [];
  const pathList: FileBrowserPath = await client.getFileBrowserPath(path);
  const fetchFileFn = pathList.getFiles;
  const boundFetchFileFn = fetchFileFn.bind(pathList);
  const params = { limit: 100, offset: 0 };
  let files: any[] = [];

  files = await fetchResource(params, boundFetchFileFn);

  if (
    foldersList.data &&
    foldersList.data[0].subfolders &&
    foldersList.data[0].subfolders.length > 0
  ) {
    folders = foldersList.data[0].subfolders.split(",");
  }

  return {
    files,
    folders,
  };
};

function* fetchPluginFiles(action: IActionTypeParam) {
  const { id, path } = action.payload;

  try {
    const { files, folders } = yield fetchFilesFromAPath(path);
    const payload = {
      id,
      files,
      folders,
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
            previousInstanceId
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
        })
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
  yield takeEvery(ResourceTypes.STOP_FETCHING_PLUGIN_RESOURCES, function () {
    cancelPolling(pollTask);
  });
}

function* watchStatusCancelPoll(pollTask: PollTask) {
  yield takeEvery(
    ResourceTypes.STOP_FETCHING_STATUS_RESOURCES,
    function (action: IActionTypeParam) {
      const id = action.payload;
      const taskToCancel = pollTask[id];
      cancelStatusPolling(taskToCancel);
    }
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
    pollInstanceEndpoints
  );
}

function* watchResetActiveResources() {
  yield takeEvery(
    ResourceTypes.RESET_ACTIVE_RESOURCES,
    handleResetActiveResources
  );
}

function* watchSelectedPlugin() {
  yield takeEvery(
    PluginInstanceTypes.GET_SELECTED_PLUGIN,
    pollorCancelEndpoints
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
  const strData = atob(raw);
  const data = inflate(strData);

  let output = "";
  for (let i = 0; i < data.length; i++) {
    output += String.fromCharCode(parseInt(data[i]));
  }

  return JSON.parse(output);
}
