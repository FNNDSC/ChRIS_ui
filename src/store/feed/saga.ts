import { all, fork, put, takeEvery } from 'redux-saga/effects'
import { Feed, FeedList, Plugin, PluginInstance } from '@fnndsc/chrisapi'
import { FeedActionTypes } from './types'
import { IActionTypeParam } from '../../api/models/base.model'
import ChrisAPIClient from '../../api/chrisapiclient'
import {
  getAllFeedsSuccess,
  getAllFeedsError,
  getFeedSuccess,
  getFeedError,
  downloadFeedError,
  downloadFeedSuccess,
  mergeFeedError,
  mergeFeedSuccess,
  getFeedResourcesSucess,
} from './actions'
import { getPluginInstancesRequest } from '../pluginInstance/actions'
import { getPlugin } from '../../components/feed/CreateFeed/utils/createFeed'
import cujs from 'chris-upload'

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload
  const params = {
    name,
    limit,
    offset,
  }
  const client = ChrisAPIClient.getClient()
  try {
    const feedsList: FeedList = yield client.getFeeds(params)
    const totalCount = feedsList.totalCount
    const feeds: Feed[] = feedsList.getItems() || []
    const payload = {
      feeds,
      totalCount,
    }

    yield put(getAllFeedsSuccess(payload))
  } catch (error) {
    yield put(getAllFeedsError(error))
  }
}

function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload)
    const client = ChrisAPIClient.getClient()
    const feed: Feed = yield client.getFeed(id)

    if (feed) {
      yield all([
        put(getFeedSuccess(feed)),
        put(getPluginInstancesRequest(feed)),
      ])
    } else {
      throw new Error(`Unable to fetch a Feed with that ID `)
    }
  } catch (error) {
    yield put(getFeedError(error))
  }
}



function* handleDowloadFeed(action: IActionTypeParam) {
  const feedList = action.payload;
  const client = ChrisAPIClient.getClient();
  const cu = new cujs();
  cu.setClient(client);
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
    newFeedName = `Archive of ${newFeedName}`;
    newFeedName = newFeedName.substring(0, 100);

    const createdFeed: Feed = yield cu.downloadMultipleFeeds(
      feedIdList,
      newFeedName
    );
    newFeeds.push(createdFeed);
  } catch (error: any) {
    const errorParsed = error.response.data.value[0];
    yield put(downloadFeedError(errorParsed));
  }

  yield put(downloadFeedSuccess(newFeeds));
}

function* handleMergeFeed(action: IActionTypeParam) {
  const feedList = action.payload;
  const client = ChrisAPIClient.getClient();
  const cu = new cujs();
  cu.setClient(client);

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

    const createdFeed: Feed = yield cu.mergeMultipleFeeds(
      feedIdList,
      newFeedName
    );
    newFeeds.push(createdFeed);
  } catch (error: any) {
    const errorParsed = error.response.data.value[0];
    yield put(mergeFeedError(errorParsed));
  }

  yield put(mergeFeedSuccess(newFeeds));
}

function* handleFeedResources(action: IActionTypeParam) {
  const client = ChrisAPIClient.getClient();
  const cu = new cujs();
  cu.setClient(client);
  try {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    let details: Record<string, unknown> = {};
    details.progress = 0;
    do {
      details = yield cu.getPluginInstanceDetails(action.payload);
      const payload = {
        details,
        id: action.payload.data.id,
      };
      yield delay(2000);
      yield put(getFeedResourcesSucess(payload));
    } while (details.progress !== 100 && !details.error);
  } catch (error) {}
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS_REQUEST, handleGetAllFeeds)
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails)
}

function* watchDownloadRequest() {
  yield takeEvery(FeedActionTypes.DOWNLOAD_FEED_REQUEST, handleDowloadFeed)
}

function* watchMergeRequest() {
  yield takeEvery(FeedActionTypes.MERGE_FEED_REQUEST, handleMergeFeed)
}

function* watchGetFeedResources() {
  yield takeEvery(
    FeedActionTypes.GET_FEED_RESOURCES_REQUEST,
    handleFeedResources,
  )
}

export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchDownloadRequest),
    fork(watchMergeRequest),
    fork(watchGetFeedResources),
  ])
}
