import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { IFeedState, FeedActionTypes } from "./types";
import FeedModel from "../../api/models/feed.model";
import {
    getFeedDetailsSuccess,
    getPluginInstanceListRequest,
    getPluginInstanceListSuccess,
    getPluginDescendantsSuccess
} from "./actions";


// ------------------------------------------------------------------------
// Description: Get Feed's details
// ------------------------------------------------------------------------
// const url = `${process.env.REACT_APP_CHRIS_UI_URL}`; // process.env.REACT_APP_CHRIS_UI_URL || ''; //"https://localhost:8000/api/v1/"
function* handleGetFeedDetails(action: any) {
    try {
        const res = yield call(FeedModel.getFeed, action.payload);
        if (res.error) {
            // yield put(handleUIMessage({ message: res.error, type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
            console.error(res.error); // working user messaging
        } else {
            yield put(getFeedDetailsSuccess(res.data));
            const url = res.data.plugin_instances;
            yield put(getPluginInstanceListRequest(url));
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
function* watchGetFeedRequest() {
    yield takeEvery(FeedActionTypes.GET_FEED_DETAILS, handleGetFeedDetails);
}

// ------------------------------------------------------------------------
// Description: Get Plugin instances
// ------------------------------------------------------------------------
function* handleGetPluginInstances(action: any) {
    try {
        const res = yield call(FeedModel.getPluginRequest, action.payload);
        if (res.error) {
            // yield put(handleUIMessage({ message: res.error, type: UIMessageType.error, displayType: MessageHandlerType.toastr }));
            console.error(res.error); // working user messaging
        } else {
            yield put(getPluginInstanceListSuccess(res));
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
function* watchGetPluginInstances() {
    yield takeEvery(FeedActionTypes.GET_PLUGIN_INSTANCES, handleGetPluginInstances);
}
// ------------------------------------------------------------------------
// Description: Get Plugin Descendants
// ------------------------------------------------------------------------
function* handleGetPluginDescendants(action: any) {
    try {
        const res = yield call(FeedModel.getPluginRequest, action.payload);
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
    yield takeEvery(FeedActionTypes.GET_PLUGIN_DESCENDANTS, handleGetPluginDescendants);
}


// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* feedSaga() {
    yield all([
      fork(watchGetFeedRequest),
      fork(watchGetPluginInstances),
      fork(watchGetPluginDescendants)
    ]);
  }
