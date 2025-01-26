/*
 *   File:           rootSaga.ts
 *   Description:    this is where the Sagas comes together
 *   Author:         ChRIS UI
 */

import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:

import { cartSaga } from "../cart/saga";

export function* rootSaga() {
  yield all([fork(cartSaga)]);
}
