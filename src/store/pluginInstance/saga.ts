import { all, takeEvery, fork, put } from "@redux-saga/core/effects";
import { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { PluginInstanceTypes } from "./types";
import { IActionTypeParam } from "../../api/models/base.model";
import {
  getPluginInstancesSuccess,
  getPluginInstancesError,
  addNodeSuccess,
  addSplitNodesSuccess,
  deleteNodeSuccess,
  deleteNodeError,
  getSelectedPlugin,
} from "./actions";
import { getPluginInstanceStatusRequest } from "../resources/actions";
import { catchError, fetchResource } from "../../api/common";

function* setPluginInstances(feed: Feed) {
  try {
    const params = { limit: 15, offset: 0 };
    const fn = feed.getPluginInstances;
    const boundFn = fn.bind(feed);
    const { resource: pluginInstances } = yield fetchResource<PluginInstance>(
      params,
      boundFn
    );
    const selected = pluginInstances[pluginInstances.length - 1];
    const pluginInstanceObj = {
      selected,
      pluginInstances,
    };

    yield all([
      put(getSelectedPlugin(selected)),
      put(getPluginInstancesSuccess(pluginInstanceObj)),
      put(getPluginInstanceStatusRequest(pluginInstanceObj)),
    ]);
  } catch (error: any) {
    const errObj = catchError(error);
    yield put(getPluginInstancesError(errObj));
  }
}

function* handleGetPluginInstances(action: IActionTypeParam) {
  const feed: Feed = action.payload;
  yield setPluginInstances(feed);
}

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
  const instance = action.payload.instance;
  const feed = action.payload.feed;

  try {
    if (
      !["finishedSuccessfully", "finishedWithError", "cancelled"].includes(
        instance.data.status
      )
    ) {
      yield instance.put({
        status: "cancelled",
      });
    }
    yield instance.delete();
    yield setPluginInstances(feed);
    yield put(deleteNodeSuccess());
  } catch (error) {
    //@ts-ignore
    const errObj = catchError(error);
    yield put(deleteNodeError(errObj));
  }
}

function* watchGetPluginInstanceRequest() {
  yield takeEvery(
    PluginInstanceTypes.GET_PLUGIN_INSTANCES_REQUEST,
    handleGetPluginInstances
  );
}

function* watchAddNode() {
  yield takeEvery(PluginInstanceTypes.ADD_NODE_REQUEST, handleAddNode);
}

function* watchAddSplitNode() {
  yield takeEvery(PluginInstanceTypes.ADD_SPLIT_NODES, handleSplitNode);
}

function* watchDeleteNode() {
  yield takeEvery(PluginInstanceTypes.DELETE_NODE, handleDeleteNode);
}

export function* pluginInstanceSaga() {
  yield all([
    fork(watchGetPluginInstanceRequest),
    fork(watchAddNode),
    fork(watchDeleteNode),
    fork(watchDeleteNode),
    fork(watchAddSplitNode),
  ]);
}
