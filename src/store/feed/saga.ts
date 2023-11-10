import { all, fork, put, takeEvery } from "redux-saga/effects";

import { Feed } from "@fnndsc/chrisapi";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/model";
import ChrisAPIClient from "../../api/chrisapiclient";
import { getFeedSuccess, getFeedError } from "./actions";
import { getPluginInstancesRequest } from "../pluginInstance/actions";

import { catchError } from "../../api/common";

function* handleGetFeedDetails(action: IActionTypeParam) {
  const id = Number(action.payload);
  const client = ChrisAPIClient.getClient();

  try {
    const feed: Feed = yield client.getFeed(id);

    yield all([
      put(getFeedSuccess(feed)),
      put(getPluginInstancesRequest(feed)),
    ]);
  } catch (error) {
    const errObject = catchError(error);
    yield put(getFeedError(errObject));
  }
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

export function* feedSaga() {
  yield all([fork(watchGetFeedRequest)]);
}
