import { all, fork, put, takeEvery } from "redux-saga/effects";
import { Feed, FeedList, Plugin, PluginInstance } from "@fnndsc/chrisapi";
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
} from "./actions";
import { getPluginInstancesRequest } from "../pluginInstance/actions";
import { getPlugin } from "../../components/feed/CreateFeed/utils/createFeed";
import cujs from "chris-upload";

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload;
  const params = {
    name,
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

function* handleDowloadFeed(action: IActionTypeParam) {
  const { data } = action.payload;

  const path = `${data.creator_username}/feed_${data.id}/`;
  const client = ChrisAPIClient.getClient();
  const cu = new cujs();
  cu.setClient(client);
  //@ts-ignore
  const dircopy: Plugin = yield getPlugin("pl-dircopy");

  if (dircopy instanceof Plugin) {
    try {
      const createdInstance: PluginInstance = yield client.createPluginInstance(
        dircopy.data.id,
        {
          //@ts-ignore
          dir: path,
          title: `Downloading ${data.name}`,
        }
      );
      const feed: Feed = yield createdInstance.getFeed();
      yield put(downloadFeedSuccess(feed));

      try {
        yield getPlugin("pl-pfdorun");
        cu.zipFiles(createdInstance.data.id);
      } catch (error) {
        throw new Error("Please upload and register pl-pfdorun");
      }
    } catch (error: any) {
      const errorParsed = error.response.data.value[0];
      yield put(downloadFeedError(errorParsed));
    }
  }
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

export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchDownloadRequest),
  ]);
}
