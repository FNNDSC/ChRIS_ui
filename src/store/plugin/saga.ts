import {
  all,
  call,
  fork,
  put,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getPluginDetailsSuccess,
  getPluginDescendantsSuccess,
  getPluginFilesSuccess,
  getParamsSuccess,
} from "./actions";
import { PluginInstance } from "@fnndsc/chrisapi";
// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------
function* handleGetPluginDetails(action: IActionTypeParam) {
  try {
    const item: PluginInstance = action.payload;
    const descendantsList = yield item.getDescendantPluginInstances({});
    const descendants = descendantsList.getItems();

    if (descendants.length < 0) {
      console.error("This plugin has no descendants");
    } else {
      yield put(getPluginDetailsSuccess(descendants));
    }
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
// Description: Get Plugin Descendants
// ------------------------------------------------------------------------
function* handleGetPluginDescendants(action: IActionTypeParam) {
  try {
    const res = yield call(ChrisModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginDescendantsSuccess(res));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetPluginDescendants() {
  yield takeEvery(
    PluginActionTypes.GET_PLUGIN_DESCENDANTS,
    handleGetPluginDescendants
  );
}

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others
// @Param: action.payload === selected plugin
// ------------------------------------------------------------------------

function* handleGetPluginFiles(action: IActionTypeParam) {
  const item = action.payload;
  const id = item.id as number;

  try {
    const client = yield ChrisAPIClient.getClient();
    const params = { limit: 500, offset: 0 };

    const pluginInstance = yield client.getPluginInstance(id);
    pluginInstance.get();

    let fileList = yield pluginInstance.getFiles(params);

    let files = fileList.getItems();

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList = yield pluginInstance.getFiles(params);
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
  yield takeLatest(PluginActionTypes.GET_PLUGIN_FILES, handleGetPluginFiles);
}
// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([
    fork(watchGetPluginDetails),
    fork(watchGetPluginDescendants),
    fork(watchGetPluginFiles),
    fork(watchGetParams),
  ]);
}
