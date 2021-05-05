/*
 *  File:            feed/types.ts
 *  Description:     Holds types and constants for managing Chris API feed calls
 *  Author:          ChRIS UI
 *  Notes:           Work in progres ...
 */
import keyMirror from "keymirror";
import { Feed } from "@fnndsc/chrisapi";

export interface FeedPayload {
  data?: Feed;
  error: any;
  loading: boolean;
}

export interface IFeedState {
  allFeeds: {
    data?: Feed[];
    error: any;
    loading: boolean;
    totalFeedsCount: 0;
  };
  currentFeed: FeedPayload;
}

export const FeedActionTypes = keyMirror({
  GET_ALL_FEEDS_REQUEST: null,
  GET_ALL_FEEDS_ERROR: null,
  GET_ALL_FEEDS_SUCCESS: null,
  GET_FEED_REQUEST: null,
  GET_FEED_SUCCESS: null,
  GET_FEED_ERROR: null,
  ADD_FEED: null,
});
