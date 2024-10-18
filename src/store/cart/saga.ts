import { all, fork } from "redux-saga/effects";
import { watchAnonymize, watchDownload } from "./downloadSaga";
import { watchCancelUpload, watchUpload } from "./uploadSaga";

export function* cartSaga() {
  yield all([
    fork(watchDownload),
    fork(watchUpload),
    fork(watchAnonymize),
    fork(watchCancelUpload),
  ]);
}
