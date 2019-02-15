/*
 *   File:           rootSaga.ts
 *   Description:    this is where the Sagas comes together
 *   Author:         ChRIS ui Demo
 */

import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:
import { feedSaga } from "../feed/saga";


export function* rootSaga() {
  yield all([fork(feedSaga)]);
}
