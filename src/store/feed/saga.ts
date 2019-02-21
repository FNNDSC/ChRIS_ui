import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { IFeedState, FeedActionTypes } from './types';
import FeedModel from '../../api/models/feed.model';
import {
    getPluginInstanceListSuccess
} from './actions';


// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------
const url = `${process.env.REACT_APP_CHRIS_UI_URL}`; // process.env.REACT_APP_CHRIS_UI_URL || ''; //"https://localhost:8000/api/v1/"
function* handleGetPluginInstances(action: any) {
    try {
        const res = yield call(FeedModel.getPluginInstance, action.payload);
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
function* watchGetFeedRequest() {
    yield takeEvery(FeedActionTypes.FETCH_REQUEST, handleGetPluginInstances);
}




// We can also use `fork()` here to split our saga into multiple watchers.
export function* feedSaga() {
    yield all([
      fork(watchGetFeedRequest),
    ]);
  }
