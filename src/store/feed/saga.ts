import {
  all,
  fork,
  put,
  takeEvery,
  call,
  delay,
  takeLatest
} from "redux-saga/effects";
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
  getPluginInstanceResources,
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  getFeedError,
} from "./actions";
import {PluginStatusLabels} from './types'

import { Task } from "redux-saga";
import { inflate } from "pako";


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
  try {
    let feedsList = yield client.getFeeds(params);
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
    let pluginInstanceObj = {
      selected,
      pluginInstances,
    };

    yield all([
      put(getPluginInstancesSuccess(pluginInstanceObj)),
      put(getPluginInstanceResources(pluginInstanceObj.pluginInstances)),
    ]);
  } catch (error) {
     yield put(getPluginInstancesError(error));
  }
}

function* handleAddNode(action: IActionTypeParam) {
  const item = action.payload.pluginItem;
  const pluginInstances=[...action.payload.nodes, item]

  try {
    yield put;
    yield all([put(addNodeSuccess(item)), put(getSelectedPlugin(item))]);
    yield put(getPluginInstanceResources(pluginInstances))
  } catch (err) {
    console.error(err);
  }
}

function* handleDeleteNode(action: IActionTypeParam) {
  const feed = action.payload;
  
  try {
    yield all([put(getPluginInstancesRequest(feed)), put(deleteNodeSuccess())]);
  } catch (err) {
    console.log("Delete Node Error", err);
  }
}


function* handleGetPluginStatus( 
  instance: PluginInstance
) {
  
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

      let payload = {
        id: pluginDetails.data.id,
        pluginStatus: parsedStatus,
        pluginLog: output,
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
    const params = { limit: 500, offset: 0 };
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

    let id = plugin.data.id;
    let payload = {
      id,
      files,
    };

    if (files.length > 0) yield put(getPluginFilesSuccess(payload));
  } catch (error) {
    let id = plugin.data.id;
    let payload = {
      id,
      error,
    };
    yield put(getPluginFilesError(payload));
  }
}

function cancelPolling(task: Task) {
  if  (task)  {
    task.cancel();
  }
}


type PollTask={
   [id: number]: Task 
}

function* watchCancelPoll(pollTask: PollTask) {

  yield takeEvery(
    FeedActionTypes.STOP_FETCHING_PLUGIN_RESOURCES,
    function (action:  IActionTypeParam) {
      const id  =  action.payload;
      const taskToCancel  =  pollTask[id];
      cancelPolling(taskToCancel)
    });
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  const pluginInstances = action.payload;
  let pollTask: {
    [id: number]: Task;
  } = {};

  

  for (let i = 0; i < pluginInstances.length; i++) {
    const instance = pluginInstances[i];
    const task = yield fork(handleGetPluginStatus, instance);
    pollTask[instance.data.id] = task;
    
  }

  yield watchCancelPoll(pollTask);
}


function* handlePluginReset(action: IActionTypeParam) {
  const pluginInstances = action.payload;
 
  for (let i = 0; i < pluginInstances.length; i++) {
    yield put(stopFetchingPluginResources(pluginInstances[i].data.id));
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

function* watchGetPluginInstanceResources() {
  yield takeLatest(
    FeedActionTypes.GET_PLUGIN_INSTANCE_RESOURCE_REQUEST,
    pollorCancelEndpoints
  );
}

function* watchAddNode() {
  yield takeEvery(FeedActionTypes.ADD_NODE_REQUEST, handleAddNode);
}

function* watchDeleteNode() {
  yield takeEvery(FeedActionTypes.DELETE_NODE, handleDeleteNode);
}

function* watchResetState(){
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
    fork(watchGetPluginInstanceResources),
    fork(watchAddNode),
    fork(watchDeleteNode),
    fork(watchResetState)
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