import { all, fork, put, takeEvery } from "redux-saga/effects";
import { PluginActionTypes } from "./types";
import { IActionTypeParam } from "../../api/model";

import {
  getParamsSuccess,
  getComputeEnvSuccess,
  getComputeEnvError,
} from "./actions";
import { PluginParameter } from "@fnndsc/chrisapi";
import { catchError, fetchResource } from "../../api/common";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------

function* handleGetParams(action: IActionTypeParam) {
  try {
    const plugin = action.payload;
    const fn = plugin.getPluginParameters;
    const boundFn = fn.bind(plugin);
    const { resource: params } = yield fetchResource<PluginParameter[]>(
      { limit: 20, offset: 0 },
      boundFn,
    );
    const computeFn = plugin.getPluginComputeResources;
    const boundComputeFn = computeFn.bind(plugin);
    const { resource: computeEnvs } = yield fetchResource<any>(
      { limit: 20, offset: 0 },
      boundComputeFn,
    );

    const required = params.filter(
      (param: PluginParameter) => param.data.optional === false,
    );
    const dropdown = params.filter(
      (param: PluginParameter) => param.data.optional === true,
    );

    yield all([
      put(
        getParamsSuccess({
          required,
          dropdown,
        }),
      ),
      put(getComputeEnvSuccess(computeEnvs)),
    ]);
  } catch (error: any) {
    const errObject = catchError(error);
    yield put(getComputeEnvError(errObject));
  }
}
function* watchGetParams() {
  yield takeEvery(PluginActionTypes.GET_PARAMS, handleGetParams);
}

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([fork(watchGetParams)]);
}
