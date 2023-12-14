/*
 *   File:           rootSaga.ts
 *   Description:    this is where the Sagas comes together
 *   Author:         ChRIS UI
 */

import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:

import { pluginSaga } from "../plugin/saga";
import { pluginInstanceSaga } from "../pluginInstance/saga";
import { resourceSaga } from "../resources/saga";

export function* rootSaga() {
  yield all([fork(pluginSaga), fork(pluginInstanceSaga), fork(resourceSaga)]);
}
