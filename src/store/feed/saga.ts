import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import ChrisModel, { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import {
  getAllFeedsSuccess,
  getFeedDetailsSuccess,
  getPluginInstanceListRequest,
  getPluginInstanceListSuccess,
  getAllFilesSuccess,
  getAllUploadedFiles
} from "./actions";
import { FeedFile } from "@fnndsc/chrisapi";

// ------------------------------------------------------------------------
// Description: Get Feeds list and search list by feed name (form input driven)
// pass it a param and do a search querie
// ------------------------------------------------------------------------

const client = ChrisAPIClient.getClient();

function* handleGetAllFeeds(action: IActionTypeParam) {
  let params = {
    limit: 100,
    offset: 0
  };

  let feedList = yield client.getFeeds(params);
  let feeds = feedList.getItems();

  while (feeds.hasNextPage) {
    params.offset += params.limit;
    feedList = yield client.getFeeds(params);
    feeds.push(...feedList);
  }

  feeds = feeds.map((feed: FeedFile) => feed.data);

  try {
    if (feeds) {
      yield put(getAllFeedsSuccess(feeds));
      yield getAllUploadedFiles();
    } else {
      console.error("Feeds does not exist");
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

function* handleGetAllFiles() {
  console.log("called");
  const client = ChrisAPIClient.getClient();
  const params = {
    limit: 100,
    offset: 0
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

  yield put(getAllFilesSuccess(files));
}

function* handleDeleteTempFiles(action: IActionTypeParam) {
  const params = {
    limit: 200,
    offset: 0
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
  for (const uploadedFile of files) {
    const path = uploadedFile.data.upload_path;
    const match = action.payload.find((f: string) => f === path);

    if (match) {
      uploadedFile.delete();
    }
  }
}

function* watchDeleteTempFiles() {
  yield takeEvery(FeedActionTypes.DELETE_TEMP_FILES, handleDeleteTempFiles);
}

function* watchGetAllFiles() {
  yield takeEvery(FeedActionTypes.GET_ALL_FILES, handleGetAllFiles);
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstances),
    fork(watchGetAllFiles),
    fork(watchDeleteTempFiles)
  ]);
}
