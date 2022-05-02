import { all, fork, put, takeEvery, delay, cancel } from "redux-saga/effects";
import {
  Feed,
  FeedFile,
  FeedList,
  Plugin,
  PluginInstance,
} from "@fnndsc/chrisapi";
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
  pollDownload,
  fetchStatus,
} from "./actions";
import { getPluginInstancesRequest } from "../pluginInstance/actions";
import { getPlugin } from "../../components/feed/CreateFeed/utils/createFeed";
import { getPluginFiles } from "../workflows/utils";

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
  //@ts-ignore
  const dircopy: Plugin = yield getPlugin("pl-dircopy");

  if (dircopy instanceof Plugin) {
    try {
      const createdInstance: PluginInstance = yield client.createPluginInstance(
        dircopy.data.id,
        {
          //@ts-ignore
          dir: path,
          title: `Downloading feed_${data.id}`,
        }
      );
      const feed: Feed = yield createdInstance.getFeed();
      yield put(downloadFeedSuccess(feed));
      const plpfdoArgs = {
        title: "zip_files",
        previous_id: createdInstance.data.id,
        inputFile: "input.meta.json",
        noJobLogging: true,
        exec: "'zip -r %outputDir/parent.zip %inputDir'",
      };
      try {
        const plpfdo: Plugin = yield getPlugin("pl-pfdorun");
        const plpfdoInstance: PluginInstance =
          yield client.createPluginInstance(plpfdo.data.id, plpfdoArgs);
        yield put(pollDownload(plpfdoInstance));
      } catch (error) {
        throw new Error("Please upload and register pl-pfdorun");
      }
    } catch (error: any) {
      const errorParsed = error.response.data;
      yield put(downloadFeedError(errorParsed));
    }
  }

  // const feed = createFeedInstanceWithDircopy();
}

function* pollFeedEndpoints(action: IActionTypeParam) {
  const instance = action.payload;

  do {
    yield delay(5000);

    yield instance.get();
    yield put(fetchStatus(status));
    //@ts-ignore
  } while (status !== "finishedSuccessfully" && status !== "cancelled");
  if (status === "finishedSuccessfully") {
    const files: any[] = yield getPluginFiles(instance);
    console.log("FILES DOWNLOAD:", files);
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

function* watchPollDownloadRequest() {
  yield takeEvery(FeedActionTypes.POLL_DOWNLOAD, pollFeedEndpoints);
}

export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchDownloadRequest),
    fork(watchPollDownloadRequest),
  ]);
}
