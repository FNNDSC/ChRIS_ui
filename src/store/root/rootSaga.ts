/*
 *   File:           rootSaga.ts
 *   Description:    this is where the Sagas comes together
 *   Author:         RBK - ChRIS ui Demo
 */

import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:
// import { ComponentSaga } from "../Component/saga";

export function* rootSaga() {
  // yield all([fork(ComponentSaga)]);
  yield true; // Placeholder until sagas are dev'd
}
