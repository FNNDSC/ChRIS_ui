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
    // yield put(handleUIMessage({ message: (err instanceof Error ? (err.stack!) :
    //   managerDefaults.defaultMessage.Error), type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
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
      // yield put(handleUIMessage({ message: res.error, type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginDescendantsSuccess(res));
      // yield put(managerOnCompleteRequest()); // nO need for messaging just loading false
    }
  } catch (error) {
    console.error(error); // working user messaging
    // yield put(handleUIMessage({ message: (err instanceof Error ? (err.stack!) :
    //   managerDefaults.defaultMessage.Error), type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
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
    const res = yield call(FeedModel.fetchRequest, selected.files);
    if (res.error) {
      // yield put(handleUIMessage({ message: res.error, type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginFilesSuccess(res));
      yield put(setExplorerSuccess(res.data.results, selected)); // Structure the files for explorer
      // yield put(managerOnCompleteRequest()); // nO need for messaging just loading false
    }
  } catch (error) {
    console.error(error); // working user messaging
    // yield put(handleUIMessage({ message: (err instanceof Error ? (err.stack!) :
    //   managerDefaults.defaultMessage.Error), type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
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
      // yield put(handleUIMessage({ message: res.error, type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
      console.error(res.error); // working user messaging
    } else {
      yield put(getPluginParametersSuccess(res));
      // yield put(managerOnCompleteRequest()); // nO need for messaging just loading false
    }
  } catch (error) {
    console.error(error); // working user messaging
    // yield put(handleUIMessage({ message: (err instanceof Error ? (err.stack!) :
    //   managerDefaults.defaultMessage.Error), type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
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
