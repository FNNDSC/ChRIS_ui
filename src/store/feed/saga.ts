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
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import {
  getAllFeedsSuccess,
  getFeedSuccess,
  getPluginInstancesRequest,
  getPluginInstancesSuccess,
  getSelectedPlugin,
  addNodeSuccess,
  deleteNodeSuccess,
  stopFetchingPluginResources,
  getTestStatus,
} from "./actions";
import { stopPolling, getPluginInstanceResources } from "../plugin/actions";
import { PluginActionTypes } from "../plugin/types";
import { Task } from "redux-saga";

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
      yield all([
        put(getFeedSuccess(feed)),
        put(getPluginInstancesRequest(feed)),
      ]);
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
    const params = { limit: 10, offset: 0 };
    let pluginInstanceList = yield feed.getPluginInstances(params);
    let pluginInstances = yield pluginInstanceList.getItems();
    while (pluginInstanceList.hasNextPage) {
      try {
        params.offset += params.limit;
        pluginInstanceList = yield feed.getPluginInstances(params);
        pluginInstances = pluginInstances.concat(pluginInstanceList.getItems());
      } catch (e) {
        console.error(e);
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
  } catch (err) {
    console.error(err);
  }
}

function* handleAddNode(action: IActionTypeParam) {
  const item = action.payload.pluginItem;
  const pluginInstances=[...action.payload.nodes, item]

  try {
    yield all([put(addNodeSuccess(item)), put(getSelectedPlugin(item))]);
    yield put(getPluginInstanceResources(pluginInstances))
  } catch (err) {
    console.error(err);
  }
}

function* handleDeleteNode(action: IActionTypeParam) {
  const item = action.payload;
  const feed = yield item.getFeed();

  try {
    yield item.delete();
    yield call(stopPolling);
    yield all([put(getPluginInstancesRequest(feed)), put(deleteNodeSuccess())]);
  } catch (err) {
    console.error(err);
  }
}

function* watchGetPluginInstanceRequest() {
  yield takeEvery(
    FeedActionTypes.GET_PLUGIN_INSTANCES_REQUEST,
    handleGetPluginInstances
  );
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails);
}

function* watchAddNode() {
  yield takeEvery(FeedActionTypes.ADD_NODE, handleAddNode);
}

function* watchDeleteNode() {
  yield takeEvery(FeedActionTypes.DELETE_NODE, handleDeleteNode)
}


function* handleGetPluginStatus( 
  instance: PluginInstance
) {
  
  while (true) {
    try {
      const pluginDetails = yield instance.get();
      yield put(getTestStatus(pluginDetails.data.summary));

      if (pluginDetails.data.status === "finishedWithError") {
        yield put(stopFetchingPluginResources(instance.data.id));
      }
      if (pluginDetails.data.status === "finishedSuccessfully") {
        yield put(stopFetchingPluginResources(instance.data.id));
      } else {
        //yield put(getTestStatus(pluginDetails.data.summary));
        yield delay(3000);
      }
    } catch (error) {
      console.log("Error", error);
      yield put(stopFetchingPluginResources(instance.data.id));
    }
  }
}

function cancelPolling(task: Task) {
  if(task){
  task.cancel();
  }

}

function* watchCancelPoll(pollTask: { [id: number]: Task }) {
  yield takeEvery(
    FeedActionTypes.STOP_FETCHING_PLUGIN_RESOURCES,
    (action:  IActionTypeParam)  =>  {
      const id  =  action.payload;
      const taskToCancel  =  pollTask[id];
      cancelPolling(taskToCancel)
    }
  );
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  
  const pluginInstances = action.payload;
  
  let pollTask: {
    [id: number]: Task;
  } = {};

  for (let i = 0; i < pluginInstances.length; i++) {
    const task = yield fork(handleGetPluginStatus,pluginInstances[i]);
    pollTask[pluginInstances[i].data.id] = task; 
  }
  yield watchCancelPoll(pollTask);
}

function* watchGetPluginInstanceResources() {

  yield takeLatest(
    PluginActionTypes.GET_PLUGIN_RESOURCES,
    pollorCancelEndpoints
  );
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
    fork(watchDeleteNode),
    fork(watchGetPluginInstanceResources),
   
  ]);
}
