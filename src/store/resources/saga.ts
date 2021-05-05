import {
  all,
  fork,
  takeEvery,
  put,
  call,
  delay,
} from "@redux-saga/core/effects";
import { Task } from "redux-saga";
import { IActionTypeParam } from "../../api/models/base.model";
import { ResourceTypes, PluginStatusLabels } from "./types";
import { PluginInstance, PluginInstanceFileList } from "@fnndsc/chrisapi";
import { inflate } from "pako";
import {
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  getPluginFilesSuccess,
  getPluginFilesError,
} from "./actions";

function* fetchPluginFiles(plugin: PluginInstance) {
  try {
    const params = { limit: 200, offset: 0 };
    let fileList: PluginInstanceFileList = yield plugin.getFiles(params);
    let files = fileList.getItems();

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList = yield plugin.getFiles(params);
        files = files.concat(fileList.getItems());
      } catch (e) {
        throw new Error("Error while paginating files");
      }
    }

    const id = plugin.data.id;
    const payload = {
      id,
      files,
    };

    if (files.length > 0) yield put(getPluginFilesSuccess(payload));
  } catch (error) {
    const id = plugin.data.id;
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
      const pluginDetails = yield instance.get();
      const pluginStatus = yield pluginDetails.data.summary;

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
      };
      yield put(getPluginInstanceResourceSuccess(payload));
      if (
        pluginDetails.data.status === "finishedWithError" ||
        pluginDetails.data.status === "cancelled"
      ) {
        yield put(stopFetchingPluginResources(instance.data.id));
      }
      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield call(fetchPluginFiles, instance);
        yield put(stopFetchingPluginResources(instance.data.id));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingPluginResources(instance.data.id));
    }
  }
}

function cancelPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function* watchCancelPoll(pollTask: Task) {
  yield takeEvery(ResourceTypes.STOP_FETCHING_PLUGIN_RESOURCES, function () {
    cancelPolling(pollTask);
  });
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  const instance = action.payload;
  const task = yield fork(handleGetPluginStatus, instance);
  yield watchCancelPoll(task);
}

function* watchGetPluginFilesRequest() {
  yield takeEvery(
    ResourceTypes.GET_PLUGIN_FILES_REQUEST,
    pollorCancelEndpoints
  );
}

export function* resourceSaga() {
  yield all([fork(watchGetPluginFilesRequest)]);
}

/**
 * Utility Functions
 */

function getLog(raw: string) {
  const strData = atob(raw);
  const data = inflate(strData);

  let output = "";
  for (let i = 0; i < data.length; i++) {
    output += String.fromCharCode(parseInt(data[i]));
  }

  return JSON.parse(output);
}
