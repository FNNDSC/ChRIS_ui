import {
  all,
  fork,
  put,
  takeEvery,

} from "redux-saga/effects";
import { PluginActionTypes,} from "./types";
import { IActionTypeParam } from "../../api/models/base.model";

import {
  getParamsSuccess,
  getComputeEnvSuccess,
} from "./actions";
import { PluginInstanceFileList } from "@fnndsc/chrisapi";


// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------

function* handleGetParams(action: IActionTypeParam) {
  try {
    const plugin = action.payload;
    const paginate = { limit: 20, offset: 0 };
    let paramList: PluginInstanceFileList = yield plugin.getPluginParameters(
      paginate
    );
    //@ts-ignore
    let computeEnvList = yield plugin.getPluginComputeResources(paginate);
    console.log("Compute env list", computeEnvList);
    let params = paramList.getItems();
  
    let computeEnvs = computeEnvList.getItems();
    while (paramList.hasNextPage) {
      try {
        paginate.offset += paginate.limit;
        paramList = plugin.getPluginParameters(paginate);
        params = params.concat(paramList.getItems());
      } catch (error) {
        // Error handling to be done
        console.error(error);
      }
    }
    while (computeEnvList.hasNextPage) {
      try {
        paginate.offset += paginate.limit;
        computeEnvList = plugin.getPluginComputeResources(paginate);
        computeEnvs = computeEnvs.concat(computeEnvList.getItems());
      } catch (error) {
        console.error(error);
      }
    }

    yield all([
      put(getParamsSuccess(params)),
      put(getComputeEnvSuccess(computeEnvs)),
    ]);
  } catch (error) {
    console.error(error);
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


