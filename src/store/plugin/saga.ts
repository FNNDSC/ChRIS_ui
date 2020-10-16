import {
  all,
  call,
  fork,
  put,
  takeEvery,
  delay,
  cancel,
  takeLatest,
} from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";

import {
  getPluginStatus,
  getPluginFilesSuccess,
  getParamsSuccess,
  getPluginLog,
  stopPolling,
} from "./actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import { inflate } from "pako";
import { Task } from "redux-saga";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------

function* handleGetParams(action: IActionTypeParam) {
  try {
    const plugin = action.payload;
    const paramList = yield plugin.getPluginParameters();
    const params = paramList.getItems();

    yield put(getParamsSuccess(params));
  } catch (error) {
    console.error(error);
  }
}
function* watchGetParams() {
  yield takeEvery(PluginActionTypes.GET_PARAMS, handleGetParams);
}

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others
// @Param: action.payload === selected plugin
// ------------------------------------------------------------------------

function* handleGetPluginFiles(action: IActionTypeParam) {
  const pluginInstance = action.payload;

  while (true) {
    try {
      const pluginDetails = yield pluginInstance.get();

      yield put(getPluginStatus(pluginDetails.data.summary));
      let output = {};
      if (pluginDetails.data.raw.length > 0) {
        output = getLog(pluginDetails.data.raw);
      }
      yield put(getPluginLog(output));

      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield call(putPluginFiles, pluginInstance);
        yield put(stopPolling());
      } else {
        yield delay(3000);
      }
    } catch (err) {
      console.error(err);
      yield put(stopPolling());
    }
  }
}

function* cancelPolling(task: Task) {
  yield cancel(task);
}

function* putPluginFiles(plugin: PluginInstance) {
  try {
    const params = { limit: 500, offset: 0 };
    let fileList = yield plugin.getFiles(params);
    let files = fileList.getItems();

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList = yield plugin.getFiles(params);
        files = files.concat(fileList.getItems());
      } catch (e) {
        console.error(e);
      }
    }

    if (files.length > 0) yield put(getPluginFilesSuccess(files));
  } catch (error) {
    console.error(error);
  }
}

function* watchGetPluginFiles() {
  yield takeLatest(
    PluginActionTypes.GET_PLUGIN_FILES_REQUEST,
    pollOrCancelEndpoint
  );
}

function* pollOrCancelEndpoint(action: IActionTypeParam) {
  const pollTask = yield fork(handleGetPluginFiles, action);
  yield watchCancelPoll(pollTask);
}

function* watchCancelPoll(task: Task) {
  yield takeEvery(PluginActionTypes.STOP_POLLING, () => cancelPolling(task));
}
// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([fork(watchGetPluginFiles), fork(watchGetParams)]);
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
