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

export interface FeedResource {
  [id: string]: { details: any };
}

export interface IFeedState {
  currentFeed: FeedPayload;
  feedTreeProp: FeedTreeProp;
  currentLayout: boolean;
  bulkSelect: Feed[];
  selectAllToggle: boolean;
  searchFilter: {
    status: boolean;
    value: string;
  };
  showToolbar: boolean;
}

export const FeedActionTypes = keyMirror({
  GET_FEED_REQUEST: null,
  GET_FEED_SUCCESS: null,
  GET_FEED_ERROR: null,

  SET_LAYOUT: null,
  GET_FEED_TREE_PROP: null,
  RESET_FEED: null,

  BULK_SELECT: null,
  REMOVE_BULK_SELECT: null,
  SET_ALL_SELECT: null,
  REMOVE_ALL_SELECT: null,
  TOGGLE_SELECT_ALL: null,
  TRANSLATE_PROP: null,
  SET_SEARCH_FILTER: null,
  SHOW_TOOLBAR: null,
});
