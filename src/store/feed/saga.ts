import { all, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getAllFeedsSuccess,
  getAllFeedsError,
  getFeedSuccess,
  getFeedError,
} from "./actions";
import { getPluginInstancesRequest } from "../pluginInstance/actions";
import { Feed } from "@fnndsc/chrisapi";

import { fetchResource } from "../../utils";

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload;
  const params = {
    name,
    limit,
    offset,
  };
  const client = ChrisAPIClient.getClient();
  const fn = client.getFeeds;
  const boundFn = fn.bind(client);

  try {
    const feeds: Feed[] = yield fetchResource<Feed[]>(params, boundFn);
    const totalCount = feeds.length;
    const payload = {
      feeds,
      totalCount,
    };
    yield put(getAllFeedsSuccess(payload));
  } catch (error) {
    yield put(getAllFeedsError(error));
  }
}

function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload);
    const client = ChrisAPIClient.getClient();
    const feed: Feed = yield client.getFeed(id);

    if (feed) {
      yield all([
        put(getFeedSuccess(feed)),
        put(getPluginInstancesRequest(feed)),
      ]);
    } else {
      throw new Error(`Unable to fetch a Feed with that ID `);
    }
  } catch (error) {
    yield put(getFeedError(error));
  }
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS_REQUEST, handleGetAllFeeds);
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

export function* feedSaga() {
  yield all([fork(watchGetAllFeedsRequest), fork(watchGetFeedRequest)]);
}
