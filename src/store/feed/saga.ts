import { all, fork, put, takeEvery } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  getAllFeedsSuccess,
  getFeedSuccess,
  getPluginInstanceListRequest,
  getPluginInstanceListSuccess,
  getSelectedPluginSuccess,
  addNodeSuccess,
} from "./actions";
import { getPluginDetailsRequest } from "../plugin/actions";

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
  yield put(getAllFeedsSuccess(feedsList));
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS, handleGetAllFeeds);
}

// ------------------------------------------------------------------------
// Description: Get Feed's details
// ------------------------------------------------------------------------

function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload);
    const client = ChrisAPIClient.getClient();
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

function* handleGetPluginInstances(action: IActionTypeParam) {
  const feed: Feed = action.payload;
  try {
    const pluginInstanceList = yield feed.getPluginInstances({});
    const pluginInstances = pluginInstanceList.getItems();
    const sortedPluginInstanceList = pluginInstances.sort(
      (a: PluginInstance, b: PluginInstance) => {
        return b.data.id - a.data.id;
      }
    );

    const selected = sortedPluginInstanceList[0];

    yield put(getPluginInstanceListSuccess(sortedPluginInstanceList));
    yield put(getPluginDetailsRequest(selected));
  } catch (err) {
    console.error(err);
  }
}

function* handleAddNode(action: IActionTypeParam) {
  const item = action.payload;

  try {
    yield put(addNodeSuccess(item));
    yield put(getPluginDetailsRequest(item));
  } catch (err) {
    console.error(err);
  }
}

function* watchGetPluginInstanceRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_INSTANCES,
    handleGetPluginInstances
  );
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED, handleGetFeedDetails);
}

function* watchAddNode() {
  yield takeEvery(FeedActionTypes.ADD_NODE, handleAddNode);
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstanceRequest),
    fork(watchAddNode),
  ]);
}
