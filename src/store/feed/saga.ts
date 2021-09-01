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
import { Feed, FeedList } from "@fnndsc/chrisapi";

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name_startswith, limit, offset } = action.payload;
  const params = {
    name_startswith,
    limit,
    offset,
  };
  const client = ChrisAPIClient.getClient();

  try {
    const feedsList: FeedList = yield client.getFeeds(params);
    const totalCount = feedsList.totalCount;
    const feeds: Feed[] = feedsList.getItems() || [];
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
