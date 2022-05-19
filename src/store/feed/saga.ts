import { all, fork, put, takeEvery } from 'redux-saga/effects'
import { Feed, FeedList, Plugin, PluginInstance } from '@fnndsc/chrisapi'
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
  getFeedResourcesSucess,
} from './actions'
import { getPluginInstancesRequest } from '../pluginInstance/actions'
import { getPlugin } from '../../components/feed/CreateFeed/utils/createFeed'
import cujs from 'chris-upload'

function* handleGetAllFeeds(action: IActionTypeParam) {
  const { name, limit, offset } = action.payload
  const params = {
    name,
    limit,
    offset,
  }
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
  const dircopy: Plugin = yield getPlugin('pl-dircopy')
  const feedIdList = [];
  const newFeeds = [];
  const feedNames = [];
  for (let i = 0; i < feedList.length; i++) {
    const data = feedList[i].data
    feedIdList.push(data.id);
    feedNames.push(data.name);
  }
  try {
    let newFeedName = feedNames.toString().replace(/[, ]+/g,'_');
    newFeedName = newFeedName.substring(0,90);
    console.log(newFeedName)
    const createdFeed: Feed = yield cu.createMergeFeed(feedIdList,`Merge of ${newFeedName}`);
    newFeeds.push(createdFeed)
  }  catch(error:any) {
     const errorParsed = error.response.data.value[0]
     yield put(downloadFeedError(errorParsed))
  }
  
  yield put(downloadFeedSuccess(newFeeds));
  /*
  if (dircopy instanceof Plugin) {
    const newFeeds = []
    for (let i = 0; i < feedList.length; i++) {
      try {
        const data = feedList[i].data
        const path = `${data.creator_username}/feed_${data.id}/`
        const createdInstance: PluginInstance = yield client.createPluginInstance(
          dircopy.data.id,
          {
            //@ts-ignore
            dir: path,
            title: `Archive of ${data.name}`,
          },
        )

        const feed: Feed = yield createdInstance.getFeed()
        newFeeds.push(feed)
        try {
          yield getPlugin('pl-pfdorun')
          cu.zipFiles(createdInstance.data.id, data.name)
        } catch (error) {
          throw new Error('Please upload and register pl-pfdorun')
        }
      } catch (error:any) {
        const errorParsed = error.response.data.value[0]
        yield put(downloadFeedError(errorParsed))
      }
    }
    yield put(downloadFeedSuccess(newFeeds))
  }
  */
}

function* handleFeedResources(action: IActionTypeParam) {
  const client = ChrisAPIClient.getClient()
  const cu = new cujs()
  cu.setClient(client)
  try {
    const details: Record<string, unknown> = yield cu.getPluginInstanceDetails(action.payload)
   
    const payload = {
      details,
      id: action.payload.data.id,
    }
    yield put(getFeedResourcesSucess(payload))
  } catch (error) {}
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
    fork(watchGetFeedResources),
  ])
}
