import { all, fork, put, takeEvery } from "redux-saga/effects";
import type { IActionTypeParam } from "../../api/model";
import type { PluginParameter } from "@fnndsc/chrisapi";
import { fetchResource } from "../../api/common";
import {
  getComputeEnvError,
  getComputeEnvSuccess,
  getParamsSuccess,
} from "./pluginSlice";
import { getParams } from "./pluginSlice";

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------

function* handleGetParams(action: IActionTypeParam) {
  // Todo: Seperate these fetch resources into seperate sagas
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
    let errorMessage =
      "Unhandled error. Please reach out to @devbabymri.org to report this error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    yield put(getComputeEnvError(errorMessage));
  }
}
function* watchGetParams() {
  yield takeEvery(getParams.type, handleGetParams);
}

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([fork(watchGetParams)]);
}
