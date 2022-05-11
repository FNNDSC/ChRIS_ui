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

export interface FeedsResponsePayload {
  feeds: Feed[];
  totalCount: number;
}

export interface FeedTreeProp {
  orientation: "horizontal" | "vertical";
  translate: {
    x: number;
    y: number;
  };
}

export interface IFeedState {
  allFeeds: {
    data?: Feed[];
    error: any;
    loading: boolean;
    totalFeedsCount: number;
  };
  currentFeed: FeedPayload;
  feedTreeProp: FeedTreeProp;
  currentLayout: boolean;
  downloadError: string;
  downloadStatus: "";
  bulkSelect: Feed[];
}

export const FeedActionTypes = keyMirror({
  GET_ALL_FEEDS_REQUEST: null,
  GET_ALL_FEEDS_ERROR: null,
  GET_ALL_FEEDS_SUCCESS: null,
  GET_FEED_REQUEST: null,
  GET_FEED_SUCCESS: null,
  GET_FEED_ERROR: null,
  ADD_FEED: null,
  DELETE_FEED: null,
  DOWNLOAD_FEED_REQUEST: null,
  DOWNLOAD_FEED_SUCCESS: null,
  DOWNLOAD_FEED_ERROR: null,
  SET_LAYOUT: null,
  GET_FEED_TREE_PROP: null,
  RESET_FEED: null,
  POLL_DOWNLOAD: null,
  POLL_DOWNLOAD_SUCCESS: null,
  STOP_FETCH_FEED_RESOURCES: null,
  DOWNLOAD_STATUS: null,
  BULK_SELECT: null,
  REMOVE_BULK_SELECT: null,
});
