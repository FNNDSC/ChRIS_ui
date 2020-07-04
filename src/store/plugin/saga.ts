import {
  all,
  call,
  fork,
  put,
  takeEvery,
  delay,
  cancelled,
  cancel,
} from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";

import {
  getPluginFiles,
  getPluginStatus,
  getPluginFilesSuccess,
  getParamsSuccess,
} from "./actions";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getSelectedPluginSuccess } from "../feed/actions";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------
function* handleGetPluginDetails(action: IActionTypeParam) {
  try {
    const item: PluginInstance = action.payload;
    yield put(getSelectedPluginSuccess(item));
    yield put(getPluginFiles(item));
  } catch (error) {
    console.error(error);
  }
}

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

function* watchGetPluginDetails() {
  yield takeEvery(PluginActionTypes.GET_PLUGIN_DETAILS, handleGetPluginDetails);
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
      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield call(putPluginFiles, pluginInstance);
        yield cancel();
      }
      yield delay(2000);
    } catch (err) {
      console.error(err);
    } finally {
      if (yield cancelled()) {
        console.log("In cancel");
      }
    }
  }

  /*
  const pluginInstance = action.payload.data;

  */
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
  yield takeEvery(PluginActionTypes.GET_PLUGIN_FILES, handleGetPluginFiles);
}
// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([
    fork(watchGetPluginDetails),
    fork(watchGetPluginFiles),
    fork(watchGetParams),
  ]);
}
