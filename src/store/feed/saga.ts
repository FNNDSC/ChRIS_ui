import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getAllFeedsSuccess,
  getFeedDetailsSuccess,
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
// Description: Get Plugin instances and attempt to register files in unfinished instances
// ------------------------------------------------------------------------
function* handleGetPluginInstances(action: IActionTypeParam) {
  try {
    const res = yield call(ChrisModel.fetchRequest, action.payload); // const res = yield call(FeedModel.fetchRequest, action.payload);
    if (res.error) {
      console.error(res.error);
    } else {
      // plugin instances are not marked as "finished" until queried directly

      const instances = res.data.results;

      const startedIIndices = []; // indices of instances marked as "started"
      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];
        if (instance.status === "started") {
          startedIIndices.push(i);
        }
      }

      const queriedInstances = yield all(
        startedIIndices.map((index: number) => {
          return call(ChrisModel.fetchRequest, instances[index].url);
        })
      );
      for (let j = 0; j < queriedInstances.length; j++) {
        // replace instance data with new data
        instances[startedIIndices[j]] = queriedInstances[j].data;
      }

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
