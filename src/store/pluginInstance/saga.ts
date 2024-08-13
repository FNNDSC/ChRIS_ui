import type { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { all, fork, put, takeEvery } from "@redux-saga/core/effects";
import { catchError, fetchResource } from "../../api/common";
import type { IActionTypeParam } from "../../api/model";
import { getPluginInstanceStatusRequest } from "../resources/resourceSlice";
import {
  addNodeRequest,
  addNodeSuccess,
  getPluginInstancesError,
  getPluginInstancesRequest,
  getPluginInstancesSuccess,
  getSelectedPlugin,
} from "./pluginInstanceSlice";

function* setPluginInstances(feed: Feed) {
  try {
    const params = { limit: 15, offset: 0 };
    const fn = feed.getPluginInstances;
    const boundFn = fn.bind(feed);
    const { resource: pluginInstances } = yield fetchResource<PluginInstance>(
      params,
      boundFn,
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
    const errObj = catchError(error).error_message;
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

// ------------------------------------------------------------------------
// Description: Delete a node
// ------------------------------------------------------------------------

function* watchGetPluginInstanceRequest() {
  yield takeEvery(getPluginInstancesRequest.type, handleGetPluginInstances);
}

function* watchAddNode() {
  yield takeEvery(addNodeRequest.type, handleAddNode);
}

export function* pluginInstanceSaga() {
  yield all([fork(watchGetPluginInstanceRequest), fork(watchAddNode)]);
}
