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
  getSelectedPlugin,
} from "./actions";

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
      //put(getPluginInstanceStatusRequest(pluginInstanceObj)),
    ]);
  } catch (error) {
    yield put(getPluginInstancesError(error));
  }
}

function* handleAddNode(action: IActionTypeParam) {
  const item: PluginInstance = action.payload.pluginItem;
  const pluginInstances: PluginInstance[] = [...action.payload.nodes, item];

  try {
    yield all([
      put(addNodeSuccess(item)),
      put(getSelectedPlugin(item)),
      // put(getPluginInstanceStatusRequest({ selected: item, pluginInstances })),
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
    // getPluginInstanceStatusRequest({
    //  selected,
    //   pluginInstances: newList,
    // })
  ]);
}

// ------------------------------------------------------------------------
// Description: Delete a node
// ------------------------------------------------------------------------

function* handleDeleteNode(action: IActionTypeParam) {
  const instance = action.payload;
  const id = instance.data.id;

  yield all([
    // put(stopFetchingPluginResources(id)),
    //put(stopFetchingStatusResources(id)),
  ]);
  yield put(deleteNodeSuccess(id));
  yield instance.delete();
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
