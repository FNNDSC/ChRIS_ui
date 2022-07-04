import { all, fork, put, takeEvery, delay } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import { Feed, FeedList } from '@fnndsc/chrisapi'
import { FeedActionTypes } from './types'
import { IActionTypeParam } from '../../api/models/base.model'
import ChrisAPIClient from '../../api/chrisapiclient'
import {
  getAllFeedsSuccess,
  getAllFeedsError,
  getFeedSuccess,
  getFeedError,
  downloadFeedError,
  downloadFeedSuccess,
  mergeFeedError,
  mergeFeedSuccess,
  getFeedResourcesSucess,
  stopFetchingFeedResources,
} from './actions'
import { getPluginInstancesRequest } from '../pluginInstance/actions'

import cujs from 'chris-upload'

const params: {
  limit: number
  offset: number
  name: string
} = { limit: 0, offset: 0, name: '' }

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload
  params['name'] = name
  params['limit'] = limit
  params['offset'] = offset
  const client = ChrisAPIClient.getClient()

  try {
    const feedsList: FeedList = yield client.getFeeds(params)
    const totalCount = feedsList.totalCount
    const feeds: Feed[] = feedsList.getItems() || []
    const payload = {
      feeds,
      totalCount,
    }
    yield put(getAllFeedsSuccess(payload))
  } catch (error) {
    yield put(getAllFeedsError(error))
  }
}

function* handleGetFeedDetails(action: IActionTypeParam) {
  try {
    const id = Number(action.payload)
    const client = ChrisAPIClient.getClient()
    const feed: Feed = yield client.getFeed(id)

    if (feed) {
      yield all([
        put(getFeedSuccess(feed)),
        put(getPluginInstancesRequest(feed)),
      ])
    } else {
      throw new Error(`Unable to fetch a Feed with that ID `)
    }
  } catch (error) {
    yield put(getFeedError(error))
  }
}

function* handleDowloadFeed(action: IActionTypeParam) {
  const feedList = action.payload
  const client = ChrisAPIClient.getClient()
  const cu = new cujs()
  cu.setClient(client)
  //@ts-ignore

  const feedIdList = []
  const newFeeds = []
  const feedNames = []
  for (let i = 0; i < feedList.length; i++) {
    const data = feedList[i].data
    feedIdList.push(data.id)
    feedNames.push(data.name)
  }
  try {
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, '_')
    newFeedName = `Archive of ${newFeedName}`
    newFeedName = newFeedName.substring(0, 100)

    newFeedName = action.meta == '' ? newFeedName : action.meta

    const createdFeed: Feed = yield cu.downloadMultipleFeeds(
      feedIdList,
      newFeedName,
    )
    newFeeds.push(createdFeed)
  } catch (error) {
    //@ts-ignore
    const errorParsed = error.response.data.value[0]
    yield put(downloadFeedError(errorParsed))
  }

  yield put(downloadFeedSuccess(newFeeds))
}

function* handleMergeFeed(action: IActionTypeParam) {
  const feedList = action.payload
  const client = ChrisAPIClient.getClient()
  const cu = new cujs()
  cu.setClient(client)

  const feedIdList = []
  const newFeeds = []
  const feedNames = []
  for (let i = 0; i < feedList.length; i++) {
    const data = feedList[i].data
    feedIdList.push(data.id)
    feedNames.push(data.name)
  }
  try {
    // truncate name of the merged feed(limit=100)
    let newFeedName = feedNames.toString().replace(/[, ]+/g, '_')
    newFeedName = `Merge of ${newFeedName}`
    newFeedName = newFeedName.substring(0, 100)

    newFeedName = action.meta == '' ? newFeedName : action.meta

    const createdFeed: Feed = yield cu.mergeMultipleFeeds(
      feedIdList,
      newFeedName,
    )
    newFeeds.push(createdFeed)
  } catch (error) {
     //@ts-ignore
    const errorParsed = error.response.data.value[0]
    yield put(mergeFeedError(errorParsed))
  }

  yield put(mergeFeedSuccess(newFeeds))
}

function* handleFeedInstanceStatus(feed: Feed) {
  const client = ChrisAPIClient.getClient()
  const cu = new cujs()
  cu.setClient(client)
  while (true) {
    try {
      const details: Record<
        string,
        unknown
      > = yield cu.getPluginInstanceDetails(feed)
      const payload = {
        details,
        id: feed.data.id,
      }
      yield put(getFeedResourcesSucess(payload))
      if (details.progress === 100 || details.error === true) {
        yield put(stopFetchingFeedResources(feed))
      } else {
        yield delay(700)
      }
    } catch (error) {
      yield put(stopFetchingFeedResources(feed))
    }
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

function* watchCancelStatus(pollTask: PollTask) {
  yield takeEvery(FeedActionTypes.STOP_FETCH_FEED_RESOURCES, function (
    action: IActionTypeParam,
  ) {
    const feed = action.payload
    const taskToCancel = pollTask[feed.data.id]
    cancelPolling(taskToCancel)
  })
}

function* handleFeedResources(action: IActionTypeParam) {
  const pollTask: {
    [id: number]: Task
  } = {}
  try {
    const task: Task = yield fork(handleFeedInstanceStatus, action.payload)
    pollTask[action.payload.data.id] = task
    yield watchCancelStatus(pollTask)
  } catch (error) {
    console.log('ERROR', error)
  }
}

function* watchGetAllFeedsRequest() {
  yield takeEvery(FeedActionTypes.GET_ALL_FEEDS_REQUEST, handleGetAllFeeds)
}

function* watchGetFeedRequest() {
  yield takeEvery(FeedActionTypes.GET_FEED_REQUEST, handleGetFeedDetails)
}

function* watchDownloadRequest() {
  yield takeEvery(FeedActionTypes.DOWNLOAD_FEED_REQUEST, handleDowloadFeed)
}

function* watchMergeRequest() {
  yield takeEvery(FeedActionTypes.MERGE_FEED_REQUEST, handleMergeFeed)
}

function* watchGetFeedResources() {
  yield takeEvery(
    FeedActionTypes.GET_FEED_RESOURCES_REQUEST,
    handleFeedResources,
  )
}

export function* feedSaga() {
  yield all([
    fork(watchGetAllFeedsRequest),
    fork(watchGetFeedRequest),
    fork(watchDownloadRequest),
    fork(watchMergeRequest),
    fork(watchGetFeedResources),
  ])
}
