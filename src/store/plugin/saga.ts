import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import {
  getPluginDetailsSuccess,
  getPluginDescendantsSuccess,
  getPluginParametersSuccess,
  getPluginParametersRequest,
  getPluginStatus
} from "./actions";
import { IPluginItem } from "../../api/models/pluginInstance.model";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------
function* handleGetPluginDetails(action: IActionTypeParam) {
  try {
    const item: IPluginItem = action.payload;

    //This request registers the file in Swift
    const pluginData = yield call(ChrisModel.fetchRequest, item.url);

    yield put(getPluginStatus(pluginData.data.status));

    const res = yield call(ChrisModel.fetchRequest, item.descendants); // Get descendants first:

    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginDetailsSuccess(res));
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

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others
// ------------------------------------------------------------------------

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([fork(watchGetPluginDetails), fork(watchGetPluginDescendants)]);
}
