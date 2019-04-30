import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import ChrisModel,  { IActionTypeParam } from "../../api/models/base.model";
import {
  getAllFeedsSuccess,
  getFeedDetailsSuccess,
  getPluginInstanceListRequest,
  getPluginInstanceListSuccess
} from "./actions";

// ------------------------------------------------------------------------
// Description: Get Feeds list and search list by feed name (form input driven)
// pass it a param and do a search querie
// ------------------------------------------------------------------------
function* handleGetAllFeeds(action: IActionTypeParam) {
  try {
    const url =  !!action.payload ? `${process.env.REACT_APP_CHRIS_UI_URL}search/?name=${action.payload}` : `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const res = yield call(ChrisModel.fetchRequest, url);
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getAllFeedsSuccess(res));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS, handleGetAllFeeds);
}

// ------------------------------------------------------------------------
// Description: Get Feed's details
// ------------------------------------------------------------------------
function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${action.payload}`;
    const res = yield call(ChrisModel.fetchRequest, url);
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getFeedDetailsSuccess(res.data));
      // Note: Call the plugin instance pass it all in one state call
      const url = res.data.plugin_instances;
      yield put(getPluginInstanceListRequest(url));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_DETAILS, handleGetFeedDetails);
}

// ------------------------------------------------------------------------
// Description: Get Plugin instances
// ------------------------------------------------------------------------
function* handleGetPluginInstances(action: IActionTypeParam) {
  try {
    const res = yield call(ChrisModel.fetchRequest, action.payload); // const res = yield call(FeedModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error);
    } else {
      yield put(getPluginInstanceListSuccess(res));
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetPluginInstances() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_INSTANCES,
    handleGetPluginInstances
  );
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstances)
  ]);
}
