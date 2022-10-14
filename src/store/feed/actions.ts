import { action } from 'typesafe-actions'
import { Feed } from '@fnndsc/chrisapi'
import { FeedActionTypes, FeedsResponsePayload } from './types'

export const getAllFeedsRequest = (
  name?: string,
  limit?: number,
  offset?: number,
  polling?: boolean
) =>
  action(FeedActionTypes.GET_ALL_FEEDS_REQUEST, {
    name,
    limit,
    offset,
    polling,
  })

export const getAllFeedsSuccess = (feeds: FeedsResponsePayload) =>
  action(FeedActionTypes.GET_ALL_FEEDS_SUCCESS, feeds)
export const getAllFeedsError = (error: any) => action(FeedActionTypes.GET_ALL_FEEDS_ERROR, error)
export const getFeedRequest = (id: string) => action(FeedActionTypes.GET_FEED_REQUEST, id)
export const getFeedSuccess = (item: Feed) => action(FeedActionTypes.GET_FEED_SUCCESS, item)
export const getFeedError = (error: any) => action(FeedActionTypes.GET_FEED_ERROR, error)

export const getFeedResourcesRequest = (feed: Feed) =>
  action(FeedActionTypes.GET_FEED_RESOURCES_REQUEST, feed)

export const getFeedResourcesSucess = (payload: { id: number; details: any }) =>
  action(FeedActionTypes.GET_FEED_RESOURCES_SUCCESS, payload)

export const addFeed = (feed: Feed) => action(FeedActionTypes.ADD_FEED, feed)

export const setFeedTreeProp = (orientation: string) =>
  action(FeedActionTypes.GET_FEED_TREE_PROP, orientation)

export const setTranslate = (translate: { x: number; y: number }) =>
  action(FeedActionTypes.TRANSLATE_PROP, translate)

export const deleteFeed = (feed: Feed[]) => action(FeedActionTypes.DELETE_FEED, feed)

// Feed download
export const downloadFeedRequest = (feed: Feed[], name: any) =>
  action(FeedActionTypes.DOWNLOAD_FEED_REQUEST, feed, name)
export const downloadFeedError = (error: string) =>
  action(FeedActionTypes.DOWNLOAD_FEED_ERROR, error)
export const downloadFeedSuccess = (feed: Feed[]) =>
  action(FeedActionTypes.DOWNLOAD_FEED_SUCCESS, feed)

// Feed Merge
export const mergeFeedRequest = (feed: Feed[], name: any) =>
  action(FeedActionTypes.MERGE_FEED_REQUEST, feed, name)
export const mergeFeedError = (error: string) => action(FeedActionTypes.MERGE_FEED_ERROR, error)
export const mergeFeedSuccess = (feed: Feed[]) => action(FeedActionTypes.MERGE_FEED_SUCCESS, feed)

// Feed Duplicate
export const duplicateFeedRequest = (feed: Feed[], name: any) =>
  action(FeedActionTypes.DUPLICATE_FEED_REQUEST, feed, name)
export const duplicateFeedError = (error: string) =>
  action(FeedActionTypes.DUPLICATE_FEED_ERROR, error)
export const duplicateFeedSuccess = (feed: Feed[]) =>
  action(FeedActionTypes.DUPLICATE_FEED_SUCCESS, feed)

export const setFeedLayout = () => action(FeedActionTypes.SET_LAYOUT)

export const resetFeed = () => action(FeedActionTypes.RESET_FEED)
export const setBulkSelect = (feed: Feed) => action(FeedActionTypes.BULK_SELECT, feed)

export const toggleSelectAll = (flag: boolean) => action(FeedActionTypes.TOGGLE_SELECT_ALL, flag)

export const setAllSelect = (feeds: Feed[]) => action(FeedActionTypes.SET_ALL_SELECT, feeds)

export const removeAllSelect = (feeds: Feed[]) => action(FeedActionTypes.REMOVE_ALL_SELECT, feeds)

export const removeBulkSelect = (feed: Feed) => action(FeedActionTypes.REMOVE_BULK_SELECT, feed)

export const stopFetchingFeedResources = (feed: Feed) =>
  action(FeedActionTypes.STOP_FETCH_FEED_RESOURCES, feed)

export const cleanupFeedResources = (feed: Feed) =>
  action(FeedActionTypes.CLEANUP_FEED_RESOURCES, feed)
