import { all, fork, put, takeEvery, delay } from "redux-saga/effects";
import { Task } from "redux-saga";
import { Feed, FeedList } from "@fnndsc/chrisapi";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getAllFeedsSuccess,
  getAllFeedsError,
  getFeedSuccess,
  getFeedError,
  downloadFeedError,
  downloadFeedSuccess,
  mergeFeedError,
  mergeFeedSuccess,
  duplicateFeedError,
  duplicateFeedSuccess,
  getFeedResourcesSucess,
  stopFetchingFeedResources,
} from "./actions";
import { getPluginInstancesRequest } from "../pluginInstance/actions";
import { cujs } from "chris-utility";
import { catchError } from "../../api/common";



function* handleGetAllFeeds(action: IActionTypeParam) {
  const {search, searchType, limit, offset } = action.payload;
  const params={
    limit: limit,
    [searchType]:search,
    offset:offset
  }
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
    const errObject = catchError(error);
    yield put(getAllFeedsError(errObject));
  }
}

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

function* handleDowloadFeed(action: IActionTypeParam) {
  const feedList = action.payload;
  const client = ChrisAPIClient.getClient();

  cujs.setClient(client);
  //@ts-ignore

  const feedIdList = [];
  const newFeeds = [];
  const feedNames = [];
  for (let i = 0; i < feedList.length; i++) {
    const data = feedList[i].data;
    feedIdList.push(data.id);
    feedNames.push(data.name);
  }
  try {
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
    newFeedName = `archive-${newFeedName}`;
    newFeedName = newFeedName.substring(0, 100);

    newFeedName = action.meta == "" ? newFeedName : action.meta;

    const createdFeed: Feed = yield cujs.downloadMultipleFeeds(
      feedIdList,
      newFeedName
    );
    newFeeds.push(createdFeed);
    yield put(downloadFeedSuccess(newFeeds));
  } catch (error) {
    //@ts-ignore
    const errObject = catchError(error);
    yield put(downloadFeedError(errObject));
  }
}

function* handleMergeFeed(action: IActionTypeParam) {
  const feedList = action.payload;
  const client = ChrisAPIClient.getClient();

  cujs.setClient(client);

  const feedIdList = [];
  const newFeeds = [];
  const feedNames = [];
  for (let i = 0; i < feedList.length; i++) {
    const data = feedList[i].data;
    feedIdList.push(data.id);
    feedNames.push(data.name);
  }
  try {
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, "_");
    newFeedName = `Merge of ${newFeedName}`;
    newFeedName = newFeedName.substring(0, 100);

    newFeedName = action.meta == "" ? newFeedName : action.meta;

    const createdFeed: Feed = yield cujs.mergeMultipleFeeds(
      feedIdList,
      newFeedName
    );
    newFeeds.push(createdFeed);
    yield put(mergeFeedSuccess(newFeeds));
  } catch (error: any) {
    const errObject = catchError(error);
    yield put(mergeFeedError(errObject));
  }
}

function* handleDuplicateFeed(action: IActionTypeParam) {
  const feedList = action.payload;
  const client = ChrisAPIClient.getClient();
  cujs.setClient(client);
  const newFeeds = [];
  for (let i = 0; i < feedList.length; i++) {
    const feedIdList = [];
    const data = feedList[i].data;
    const newFeedName = action.meta
      ? action.meta + "-" + data.name
      : "duplicate-" + data.name;
    feedIdList.push(data.id);
    try {
      const createdFeed: Feed = yield cujs.mergeMultipleFeeds(
        feedIdList,
        newFeedName
      );
      newFeeds.push(createdFeed);
      yield put(duplicateFeedSuccess(newFeeds));
    } catch (error: any) {
      const errObj = catchError(error);
      yield put(duplicateFeedError(errObj));
    }
  }
}

function* handleFeedInstanceStatus(feed: Feed) {
  while (true) {
    try {
      const details: Record<string, unknown> =
        yield cujs.getPluginInstanceDetails(feed);

      const payload = {
        details,
        id: feed.data.id,
      };
      yield put(getFeedResourcesSucess(payload));
      if (details.progress === 100 || details.error === true) {
        yield put(stopFetchingFeedResources(feed));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingFeedResources(feed));
    }
  }
}

type PollTask = {
  [id: number]: Task;
};

function cancelPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function* watchCancelStatus(pollTask: PollTask) {
  yield takeEvery(
    FeedActionTypes.STOP_FETCH_FEED_RESOURCES,
    function (action: IActionTypeParam) {
      const feed = action.payload;
      const taskToCancel = pollTask[feed.data.id];
      cancelPolling(taskToCancel);
    }
  );
}

function* handleFeedResources(action: IActionTypeParam) {
  const pollTask: {
    [id: number]: Task;
  } = {};

  const task: Task = yield fork(handleFeedInstanceStatus, action.payload);
  pollTask[action.payload.data.id] = task;
  yield watchCancelStatus(pollTask);
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS_REQUEST, handleGetAllFeeds);
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

function* watchDownloadRequest() {
  yield takeEvery(FeedActionTypes.DOWNLOAD_FEED_REQUEST, handleDowloadFeed);
}

function* watchMergeRequest() {
  yield takeEvery(FeedActionTypes.MERGE_FEED_REQUEST, handleMergeFeed);
}

function* watchDuplicateRequest() {
  yield takeEvery(FeedActionTypes.DUPLICATE_FEED_REQUEST, handleDuplicateFeed);
}
function* watchGetFeedResources() {
  yield takeEvery(
    FeedActionTypes.GET_FEED_RESOURCES_REQUEST,
    handleFeedResources
  );
}

export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchDownloadRequest),
    fork(watchMergeRequest),
    fork(watchDuplicateRequest),
    fork(watchGetFeedResources),
  ]);
}
