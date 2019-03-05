import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import FeedModel from "../../api/models/feed.model";
import {
    getPluginDescendantsSuccess
} from "./actions";

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
    yield takeEvery(PluginActionTypes.GET_PLUGIN_DESCENDANTS, handleGetPluginDescendants);
}


// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* pluginSaga() {
    yield all([
      fork(watchGetPluginDescendants)
    ]);
  }
