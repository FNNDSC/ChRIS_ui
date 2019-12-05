import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import {
  getPluginDetailsSuccess,
  getPluginDescendantsSuccess,
  getPluginFilesSuccess,
  getPluginParametersSuccess,
  getPluginFilesRequest,
  getPluginParametersRequest
} from "./actions";
import { IPluginItem } from "../../api/models/pluginInstance.model";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------
function* handleGetPluginDetails(action: IActionTypeParam) {
  try {
    const item: IPluginItem = action.payload;

    yield call(ChrisModel.fetchRequest, item.url);
    const res = yield call(ChrisModel.fetchRequest, item.descendants); // Get descendants first:

    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginDetailsSuccess(res));

      !!item.parameters &&
        (yield put(getPluginParametersRequest(item.parameters)));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetPluginDetails() {
  yield takeEvery(PluginActionTypes.GET_PLUGIN_DETAILS, handleGetPluginDetails);
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
  try {
    const selected = action.payload;
    const url = `${selected.files}?limit=1000`;
    const res = yield call(ChrisModel.fetchRequest, url); // NOTE: TEMP Modification until pagination is developed
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginFilesSuccess(res));
    }
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
function* handleGetPluginParameters(action: IActionTypeParam) {
  try {
    const res = yield call(ChrisModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginParametersSuccess(res));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetPluginParameters() {
  yield takeEvery(
    PluginActionTypes.GET_PLUGIN_PARAMETERS,
    handleGetPluginParameters
  );
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([
    fork(watchGetPluginDetails),
    fork(watchGetPluginDescendants),
    fork(watchGetPluginFiles),
    fork(watchGetPluginParameters)
  ]);
}
