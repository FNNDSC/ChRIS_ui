import { all, fork, put, takeEvery, call, delay } from "redux-saga/effects";
import { FeedActionTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import { Feed, PluginInstance, PluginInstanceFileList } from "@fnndsc/chrisapi";
import {
  getAllFeedsSuccess,
  getAllFeedsError,
  getFeedSuccess,
  getPluginInstancesRequest,
  getPluginInstancesSuccess,
  getPluginInstancesError,
  getSelectedPlugin,
  getPluginFilesSuccess,
  getPluginFilesError,
  addNodeSuccess,
  deleteNodeSuccess,
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  stopFetchingStatusResources,
  getFeedError,
  getPluginInstanceStatusSuccess,
  getPluginInstanceStatusRequest,
  addSplitNodesSuccess,
} from "./actions";
import { PluginStatusLabels } from "./types";

import { Task } from "redux-saga";
import { inflate } from "pako";

// ------------------------------------------------------------------------
// Description: Get Feeds list and search list by feed name (form input driven)
// pass it a param and do a search querie
// ------------------------------------------------------------------------

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload;
  const params = {
    name,
    limit,
    offset,
  };
  const client = ChrisAPIClient.getClient();

  try {
    const feedsList = yield client.getFeeds(params);
    yield put(getAllFeedsSuccess(feedsList));
  } catch (error) {
    yield put(getAllFeedsError(error));
  }
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

// ------------------------------------------------------------------------
// Description: Get Feed's Plugin Instances
// ------------------------------------------------------------------------

function* handleGetPluginInstances(action: IActionTypeParam) {
  const feed: Feed = action.payload;
  try {
    const params = { limit: 15, offset: 0 };
    let pluginInstanceList = yield feed.getPluginInstances(params);
    let pluginInstances = yield pluginInstanceList.getItems();

    while (pluginInstanceList.hasNextPage) {
      try {
        params.offset += params.limit;
        pluginInstanceList = yield feed.getPluginInstances(params);

        pluginInstances = [
          ...pluginInstances,
          ...pluginInstanceList.getItems(),
        ];
      } catch (e) {
        throw new Error(
          "Error while fetching a paginated list of plugin Instances"
        );
      }
    }

    const selected = pluginInstances[pluginInstances.length - 1];
    const pluginInstanceObj = {
      selected,
      pluginInstances,
    };

    yield all([
      put(getPluginInstancesSuccess(pluginInstanceObj)),
      put(getPluginInstanceStatusRequest(pluginInstanceObj)),
    ]);
  } catch (error) {
    yield put(getPluginInstancesError(error));
  }
}

// ------------------------------------------------------------------------
// Description: Add a node
// ------------------------------------------------------------------------

function* handleAddNode(action: IActionTypeParam) {
  const item: PluginInstance = action.payload.pluginItem;
  const pluginInstances: PluginInstance[] = [...action.payload.nodes, item];

  try {
    yield all([
      put(addNodeSuccess(item)),
      put(getSelectedPlugin(item)),
      put(getPluginInstanceStatusRequest({ selected: item, pluginInstances })),
    ]);
  } catch (err) {
    console.error(err);
  }
}

function* handleSplitNode(action: IActionTypeParam) {
  const items: PluginInstance[] = action.payload.nodes;
  const splitNodes: PluginInstance[] = action.payload.splitNodes;
  const selected: PluginInstance = action.payload.selectedPlugin;

  const newList: PluginInstance[] = [...items, ...splitNodes];
  yield all([
    put(addSplitNodesSuccess(splitNodes)),
    put(
      getPluginInstanceStatusRequest({
        selected,
        pluginInstances: newList,
      })
    ),
  ]);
}

// ------------------------------------------------------------------------
// Description: Delete a node
// ------------------------------------------------------------------------

function* handleDeleteNode(action: IActionTypeParam) {
  const instance = action.payload;
  const id = instance.data.id;

  yield all([
    put(stopFetchingPluginResources(id)),
    put(stopFetchingStatusResources(id)),
  ]);
  yield put(deleteNodeSuccess(id));
  yield instance.delete();
}

function* handleGetPluginStatus(instance: PluginInstance) {
  while (true) {
    try {
      const pluginDetails = yield instance.get();
      const pluginStatus = yield pluginDetails.data.summary;

      let parsedStatus: PluginStatusLabels | undefined = undefined;
      if (pluginStatus) {
        parsedStatus = JSON.parse(pluginStatus);
      }

      let output = {};
      if (pluginDetails.data.raw.length > 0) {
        output = getLog(pluginDetails.data.raw);
      }

      const payload = {
        id: pluginDetails.data.id,
        pluginStatus: parsedStatus,
        pluginLog: output,
        pluginDetails: pluginDetails,
      };
      yield put(getPluginInstanceResourceSuccess(payload));
      if (
        pluginDetails.data.status === "finishedWithError" ||
        pluginDetails.data.status === "cancelled"
      ) {
        yield put(stopFetchingPluginResources(instance.data.id));
      }
      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield call(fetchPluginFiles, instance);
        yield put(stopFetchingPluginResources(instance.data.id));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingPluginResources(instance.data.id));
    }
  }
}

function* fetchPluginFiles(plugin: PluginInstance) {
  try {
    const params = { limit: 200, offset: 0 };
    let fileList: PluginInstanceFileList = yield plugin.getFiles(params);
    let files = fileList.getItems();

    while (fileList.hasNextPage) {
      try {
        params.offset += params.limit;
        fileList = yield plugin.getFiles(params);
        files = files.concat(fileList.getItems());
      } catch (e) {
        throw new Error("Error while paginating files");
      }
    }

    const id = plugin.data.id;
    const payload = {
      id,
      files,
    };

    if (files.length > 0) yield put(getPluginFilesSuccess(payload));
  } catch (error) {
    const id = plugin.data.id;
    const payload = {
      id,
      error,
    };
    yield put(getPluginFilesError(payload));
  }
}

function cancelPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function* watchCancelPoll(pollTask: Task) {
  yield takeEvery(FeedActionTypes.STOP_FETCHING_PLUGIN_RESOURCES, function () {
    cancelPolling(pollTask);
  });
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  const instance = action.payload;
  const task = yield fork(handleGetPluginStatus, instance);
  yield watchCancelPoll(task);
}

function* handleGetInstanceStatus(instance: PluginInstance) {
  while (true) {
    try {
      const pluginDetails = yield instance.get();
      yield put(
        getPluginInstanceStatusSuccess({
          selected: instance,
          status: instance.data.status,
        })
      );
      if (
        pluginDetails.data.status === "finishedWithError" ||
        pluginDetails.data.status === "cancelled"
      ) {
        yield put(stopFetchingStatusResources(instance.data.id));
      }
      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield put(stopFetchingStatusResources(instance.data.id));
      } else {
        yield delay(7000);
      }
    } catch (error) {
      yield put(stopFetchingStatusResources(instance.data.id));
    }
  }
}

type PollTask = {
  [id: number]: Task;
};

function cancelStatusPolling(task: Task) {
  if (task) {
    task.cancel();
  }
}

function* watchStatusCancelPoll(pollTask: PollTask) {
  yield takeEvery(
    FeedActionTypes.STOP_FETCHING_STATUS_RESOURCES,
    function (action: IActionTypeParam) {
      const id = action.payload;
      const taskToCancel = pollTask[id];
      cancelStatusPolling(taskToCancel);
    }
  );
}

function* pollInstanceEndpoints(action: IActionTypeParam) {
  const pluginInstances = action.payload.pluginInstances;

  const pollTask: {
    [id: number]: Task;
  } = {};

  for (let i = 0; i < pluginInstances.length; i++) {
    const instance = pluginInstances[i];
    const task = yield fork(handleGetInstanceStatus, instance);
    pollTask[instance.data.id] = task;
  }

  yield watchStatusCancelPoll(pollTask);
}

function* handlePluginReset(action: IActionTypeParam) {
  const pluginInstances = action.payload.data;
  const selectedPlugin = action.payload.selectedPlugin;
  yield put(stopFetchingPluginResources(selectedPlugin.data.id));
  for (let i = 0; i < pluginInstances.length; i++) {
    yield put(stopFetchingStatusResources(pluginInstances[i].data.id));
  }
}

/**
 * Watchers for actions
 */

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS_REQUEST, handleGetAllFeeds);
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

function* watchGetPluginInstanceRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_INSTANCES_REQUEST,
    handleGetPluginInstances
  );
}

function* watchGetPluginFilesRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_FILES_REQUEST,
    pollorCancelEndpoints
  );
}

function* watchGetPluginStatusRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_STATUS_REQUEST,
    pollInstanceEndpoints
  );
}

function* watchAddNode() {
  yield takeEvery(FeedActionTypes.ADD_NODE_REQUEST, handleAddNode);
}

function* watchAddSplitNode() {
  yield takeEvery(FeedActionTypes.ADD_SPLIT_NODES, handleSplitNode);
}

function* watchDeleteNode() {
  yield takeEvery(FeedActionTypes.DELETE_NODE, handleDeleteNode);
}

function* watchResetState() {
  yield takeEvery(FeedActionTypes.RESET_PLUGIN_STATE, handlePluginReset);
}

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchGetPluginInstanceRequest),
    fork(watchGetPluginFilesRequest),
    fork(watchAddNode),
    fork(watchDeleteNode),
    fork(watchResetState),
    fork(watchGetPluginStatusRequest),
    fork(watchAddSplitNode),
  ]);
}

/**
 * Utility Functions
 */

function getLog(raw: string) {
  const strData = atob(raw);
  const data = inflate(strData);

  let output = "";
  for (let i = 0; i < data.length; i++) {
    output += String.fromCharCode(parseInt(data[i]));
  }

  return JSON.parse(output);
}
