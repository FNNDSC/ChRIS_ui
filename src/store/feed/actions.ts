import { action } from "typesafe-actions";
import { Feed } from "@fnndsc/chrisapi";
import { FeedActionTypes, FeedsResponsePayload } from "./types";

export const getAllFeedsRequest = (
  name?: string,
  limit?: number,
  offset?: number
) =>
  action(FeedActionTypes.GET_ALL_FEEDS_REQUEST, {
    name,
    limit,
    offset,
  });

export const getAllFeedsSuccess = (feeds: FeedsResponsePayload) =>
  action(FeedActionTypes.GET_ALL_FEEDS_SUCCESS, feeds);
export const getAllFeedsError = (error: any) =>
  action(FeedActionTypes.GET_ALL_FEEDS_ERROR, error);
export const getFeedRequest = (id: string) =>
  action(FeedActionTypes.GET_FEED_REQUEST, id);
export const getFeedSuccess = (item: Feed) =>
  action(FeedActionTypes.GET_FEED_SUCCESS, item);
export const getFeedError = (error: any) =>
  action(FeedActionTypes.GET_FEED_ERROR, error);
export const addFeed = (feed: Feed) => action(FeedActionTypes.ADD_FEED, feed);

export const deleteFeed = (feed: Feed) =>
  action(FeedActionTypes.DELETE_FEED, feed);
  
export const downloadFeed = (feed: Feed) =>
  action(FeedActionTypes.DOWNLOAD_FEED, feed);

export const setFeedTreeProp = (orientation: string) =>
  action(FeedActionTypes.GET_FEED_TREE_PROP, orientation);
export const setFeedLayout = () => action(FeedActionTypes.SET_LAYOUT);

export const resetFeed = () => action(FeedActionTypes.RESET_FEED);
