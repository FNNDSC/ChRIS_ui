import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import FeedModel from "../../api/models/feed.model";
import {
  getPluginDetailsSuccess,
  getPluginDescendantsSuccess,
  getPluginFilesSuccess,
  getPluginParametersSuccess,
  getPluginFilesRequest,
  setExplorerSuccess,
  getPluginParametersRequest
} from "./actions";
import { IPluginItem } from "../../api/models/pluginInstance.model";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------
function* handleGetPluginDetails(action: any) {
  try {
    const item: IPluginItem = action.payload;
    const res = yield call(FeedModel.fetchRequest, item.descendants); // Get descendants first:
    if (res.error) {
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginDetailsSuccess(res));
      !!item.files && (yield put(getPluginFilesRequest(item)));
      !!item.parameters && (yield put(getPluginParametersRequest(item.parameters)));
    }
  } catch (error) {
    console.error(error); // working user messaging
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchGetPluginDetails() {
  yield takeEvery(PluginActionTypes.GET_PLUGIN_DETAILS, handleGetPluginDetails);
}

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants
// ------------------------------------------------------------------------
function* handleGetPluginDescendants(action: any) {
  try {
    const res = yield call(FeedModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginDescendantsSuccess(res));
    }
  } catch (error) {
    console.error(error); // working user messaging
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
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
function* handleGetPluginFiles(action: any) {
  try {
    const selected = action.payload;
    const res = yield call(FeedModel.fetchRequest, `${selected.files}?limit=1000`); // NOTE: TEMP Modification until pagination is developed
    if (res.error) {
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginFilesSuccess(res));
      yield put(setExplorerSuccess(res.data.results, selected)); // Structure the files for explorer

    }
  } catch (error) {
    console.error(error); // working user messaging
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchGetPluginFiles() {
  yield takeEvery(PluginActionTypes.GET_PLUGIN_FILES, handleGetPluginFiles);
}
// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others
// ------------------------------------------------------------------------
function* handleGetPluginParameters(action: any) {
  try {
    const res = yield call(FeedModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginParametersSuccess(res));
    }
  } catch (error) {
    console.error(error); // working user messaging
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchGetPluginParameters() {
  yield takeEvery(
    PluginActionTypes.GET_PLUGIN_PARAMETERS,
    handleGetPluginParameters
  );
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* pluginSaga() {
  yield all([
    fork(watchGetPluginDetails),
    fork(watchGetPluginDescendants),
    fork(watchGetPluginFiles),
    fork(watchGetPluginParameters)
  ]);
}
