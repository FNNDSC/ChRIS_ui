import {
  all,
  fork,
  takeEvery,
  put,
  call,
  delay,
} from '@redux-saga/core/effects'
import { Task } from 'redux-saga'
import { IActionTypeParam } from '../../api/models/base.model'
import { ResourceTypes, PluginStatusLabels } from './types'
import { PluginInstance } from '@fnndsc/chrisapi'
import { inflate } from 'pako'
import {
  getPluginInstanceResourceSuccess,
  stopFetchingPluginResources,
  stopFetchingStatusResources,
  getPluginFilesSuccess,
  getPluginFilesError,
  getPluginInstanceStatusSuccess,
} from './actions'
import { fetchResource } from '../../utils'
import ChrisAPIClient from '../../api/chrisapiclient'

export function* getPluginFiles(plugin: PluginInstance) {
  const params = { limit: 200, offset: 0 }
  const fn = plugin.getFiles
  const boundFn = fn.bind(plugin)
  const files: any[] = yield fetchResource<any>(params, boundFn)
  return files
}

function* fetchPluginFiles(plugin: PluginInstance) {
  try {
    const files: any[] = yield getPluginFiles(plugin)

    const id = plugin.data.id
    const payload = {
      id,
      files,
    }

    if (files.length > 0) yield put(getPluginFilesSuccess(payload))
  } catch (error) {
    const id = plugin.data.id
    const payload = {
      id,
      error,
    }
    yield put(getPluginFilesError(payload))
  }
}

function* handleGetPluginStatus(instance: PluginInstance) {
  while (true) {
    try {
      //@ts-ignore
      const pluginDetails = yield instance.get()
      //@ts-ignore
      const pluginStatus = yield pluginDetails.data.summary

      const previousInstanceId = instance.data.previous_id
      let previousStatus = ''
      const { status } = pluginDetails.data

      if (previousInstanceId) {
        const previousInstance: PluginInstance = yield ChrisAPIClient.getClient().getPluginInstance(
          previousInstanceId,
        )
        previousStatus = previousInstance.data.status
      }

      let parsedStatus: PluginStatusLabels | undefined = undefined
      if (pluginStatus) {
        parsedStatus = JSON.parse(pluginStatus)
      }

      let output = {}
      if (pluginDetails.data.raw.length > 0) {
        output = getLog(pluginDetails.data.raw)
      }

      const payload = {
        id: pluginDetails.data.id,
        pluginStatus: parsedStatus,
        pluginLog: output,
        pluginDetails: pluginDetails,
        previousStatus,
      }
      yield put(getPluginInstanceResourceSuccess(payload))
      if (status === 'cancelled') {
        yield put(stopFetchingPluginResources(instance.data.id))
      }
      if (status === 'finishedSuccessfully' || status === 'finishedWithError') {
        yield call(fetchPluginFiles, instance)
        yield put(stopFetchingPluginResources(instance.data.id))
      } else {
        yield delay(7000)
      }
    } catch (error) {
      yield put(stopFetchingPluginResources(instance.data.id))
    }
  }
}

function* handleGetInstanceStatus(instance: PluginInstance) {
  while (true) {
    try {
      //@ts-ignore
      const pluginDetails = yield instance.get()
      yield put(
        getPluginInstanceStatusSuccess({
          selected: instance,
          status: instance.data.status,
        }),
      )
      if (
        pluginDetails.data.status === 'finishedWithError' ||
        pluginDetails.data.status === 'cancelled'
      ) {
        yield put(stopFetchingStatusResources(instance.data.id))
      }
      if (pluginDetails.data.status === 'finishedSuccessfully') {
        yield put(stopFetchingStatusResources(instance.data.id))
      } else {
        yield delay(7000)
      }
    } catch (error) {
      yield put(stopFetchingStatusResources(instance.data.id))
    }
  }
}

function* handleResetActiveResources(action: IActionTypeParam) {
  const pluginInstances = action.payload.data
  const selectedPlugin = action.payload.selectedPlugin
  yield put(stopFetchingPluginResources(selectedPlugin.data.id))
  for (let i = 0; i < pluginInstances.length; i++) {
    yield put(stopFetchingStatusResources(pluginInstances[i].data.id))
  }
}

type PollTask = {
  [id: number]: Task
}

function cancelPolling(task: Task) {
  if (task) {
    task.cancel()
  }
}

function cancelStatusPolling(task: Task) {
  if (task) {
    task.cancel()
  }
}

function* watchCancelPoll(pollTask: Task) {
  yield takeEvery(ResourceTypes.STOP_FETCHING_PLUGIN_RESOURCES, function () {
    cancelPolling(pollTask)
  })
}

function* watchStatusCancelPoll(pollTask: PollTask) {
  yield takeEvery(ResourceTypes.STOP_FETCHING_STATUS_RESOURCES, function (
    action: IActionTypeParam,
  ) {
    const id = action.payload
    const taskToCancel = pollTask[id]
    cancelStatusPolling(taskToCancel)
  })
}

function* pollorCancelEndpoints(action: IActionTypeParam) {
  const instance = action.payload
  const task: Task = yield fork(handleGetPluginStatus, instance)
  yield watchCancelPoll(task)
}

function* pollInstanceEndpoints(action: IActionTypeParam) {
  const pluginInstances = action.payload.pluginInstances

  const pollTask: {
    [id: number]: Task
  } = {}

  for (let i = 0; i < pluginInstances.length; i++) {
    const instance = pluginInstances[i]
    const task: Task = yield fork(handleGetInstanceStatus, instance)
    pollTask[instance.data.id] = task
  }

  yield watchStatusCancelPoll(pollTask)
}

function* watchGetPluginFilesRequest() {
  yield takeEvery(ResourceTypes.GET_PLUGIN_FILES_REQUEST, pollorCancelEndpoints)
}

function* watchGetPluginStatusRequest() {
  yield takeEvery(
    ResourceTypes.GET_PLUGIN_STATUS_REQUEST,
    pollInstanceEndpoints,
  )
}

function* watchResetActiveResources() {
  yield takeEvery(
    ResourceTypes.RESET_ACTIVE_RESOURCES,
    handleResetActiveResources,
  )
}

export function* resourceSaga() {
  yield all([
    fork(watchGetPluginFilesRequest),
    fork(watchGetPluginStatusRequest),
    fork(watchResetActiveResources),
  ])
}

function getLog(raw: string) {
  const strData = atob(raw)
  const data = inflate(strData)

  let output = ''
  for (let i = 0; i < data.length; i++) {
    output += String.fromCharCode(parseInt(data[i]))
  }

  return JSON.parse(output)
}
