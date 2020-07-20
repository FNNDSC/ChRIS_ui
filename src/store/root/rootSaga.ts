/*
 *   File:           rootSaga.ts
 *   Description:    this is where the Sagas comes together
 *   Author:         ChRIS UI
 */

import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:
import { userSaga } from "../user/saga";
import { feedSaga } from "../feed/saga";
import { pluginSaga } from "../plugin/saga";
import { gallerySaga } from "../gallery/saga";

export function* rootSaga() {
  yield all([
    fork(userSaga),
    fork(feedSaga),
    fork(pluginSaga),
    fork(gallerySaga),
  ]);
}
