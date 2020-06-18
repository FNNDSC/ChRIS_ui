import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getAllFeedsSuccess,
  getFeedSuccess,
  getPluginInstanceListRequest,
  getPluginInstanceListSuccess,
  getUploadedFilesSuccess,
} from "./actions";

// ------------------------------------------------------------------------
// Description: Get Feeds list and search list by feed name (form input driven)
// pass it a param and do a search querie
// ------------------------------------------------------------------------

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload;
  let params = {
    name,
    limit,
    offset,
  };
  const client = ChrisAPIClient.getClient();
  let feedsList = yield client.getFeeds(params);
  let feeds = feedsList;
  yield put(getAllFeedsSuccess(feeds));
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS, handleGetAllFeeds);
}

// ------------------------------------------------------------------------
// Description: Get Feed's details
// ------------------------------------------------------------------------
const client = ChrisAPIClient.getClient();
function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload);
    const feed = yield client.getFeed(id);
    if (feed) {
      yield put(getFeedSuccess(feed));
      yield put(getPluginInstanceListRequest(feed));
    } else {
      console.error("Feed does not exist");
    }
  } catch (error) {
    console.error(error);
  }
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED, handleGetFeedDetails);
}

// ------------------------------------------------------------------------
// Description: Get Plugin instances and attempt to register files in unfinished instances
// ------------------------------------------------------------------------
function* handleGetPluginInstances(action: IActionTypeParam) {
  const feed = action.payload;

  try {
    let params = {
      limit: 100,
      offset: 0,
    };
    const pluginInstanceList = yield feed.getPluginInstances(params);
    //const res = yield call(ChrisModel.fetchRequest, action.payload); // const res = yield call(FeedModel.fetchRequest, action.payload);
    const pluginInstances = pluginInstanceList.getItems();

    // plugin instances are not marked as "finished" until queried directly

    const startedIIndices = []; // indices of instances marked as "started"
    for (let i = 0; i < pluginInstances.length; i++) {
      const instance = pluginInstances[i];
      if (instance.data.status === "started") {
        startedIIndices.push(i);
      }
    }
    if (startedIIndices.length > 0) {
      const queriedInstances = yield all(
        startedIIndices.map((index: number) => {
          return pluginInstances[index].get();
        })
      );
      for (let j = 0; j < queriedInstances.length; j++) {
        // replace instance data with new data
        pluginInstances[startedIIndices[j]] = queriedInstances[j].data;
      }
    }
    yield put(getPluginInstanceListSuccess(pluginInstances));
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

function* getUploadedFiles() {
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 100,
    offset: 0,
  };

  let fileList = yield client.getUploadedFiles(params);
  let files = fileList.getItems();

  while (fileList.hasNextPage) {
    try {
      params.offset += params.limit;
      fileList = yield client.getUploadedFiles(params);
      files.push(...fileList.getItems());
    } catch (e) {
      console.error(e);
    }
  }

  return files;
}

function* handleUploadedFiles() {
  const files = yield getUploadedFiles();
  if (files.length > 0) {
    yield put(getUploadedFilesSuccess(files));
  }
}

function* watchGetUploadedFiles() {
  yield takeEvery(FeedActionTypes.GET_UPLOADED_FILES, handleUploadedFiles);
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstances),
    fork(watchGetUploadedFiles),
  ]);
}
