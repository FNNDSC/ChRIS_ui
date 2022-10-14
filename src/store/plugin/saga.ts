import { all, fork, put, takeEvery } from 'redux-saga/effects'
import { PluginActionTypes } from './types'
import { IActionTypeParam } from '../../api/models/base.model'

import { getParamsSuccess, getComputeEnvSuccess } from './actions'
import { PluginParameter } from '@fnndsc/chrisapi'
import { fetchResource } from '../../utils'

// ------------------------------------------------------------------------
// Description: Get Plugin Descendants, files and parameters on change
// ------------------------------------------------------------------------

function* handleGetParams(action: IActionTypeParam) {
  try {
    const plugin = action.payload
    const fn = plugin.getPluginParameters
    const boundFn = fn.bind(plugin)
    const params: PluginParameter[] = yield fetchResource<PluginParameter[]>(
      { limit: 20, offset: 0 },
      boundFn
    )
    const computeFn = plugin.getPluginComputeResources
    const boundComputeFn = computeFn.bind(plugin)
    const computeEnvs: any[] = yield fetchResource<any>({ limit: 20, offset: 0 }, boundComputeFn)

    yield all([put(getParamsSuccess(params)), put(getComputeEnvSuccess(computeEnvs))])
  } catch (error) {
    console.error(error)
  }
}
function* watchGetParams() {
  yield takeEvery(PluginActionTypes.GET_PARAMS, handleGetParams)
}

// ------------------------------------------------------------------------
// Description: Get Plugin Details: Parameters, files and others

// ------------------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
// ------------------------------------------------------------------------
export function* pluginSaga() {
  yield all([fork(watchGetParams)])
}
