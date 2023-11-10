import { action } from "typesafe-actions";
import { Feed } from "@fnndsc/chrisapi";
import { FeedActionTypes } from "./types";

export const getFeedRequest = (id: string) =>
  action(FeedActionTypes.GET_FEED_REQUEST, id);
export const getFeedSuccess = (item: Feed) =>
  action(FeedActionTypes.GET_FEED_SUCCESS, item);
export const getFeedError = (error: any) =>
  action(FeedActionTypes.GET_FEED_ERROR, error);

export const setFeedTreeProp = (orientation: string) =>
  action(FeedActionTypes.GET_FEED_TREE_PROP, orientation);

export const setTranslate = (translate: { x: number; y: number }) =>
  action(FeedActionTypes.TRANSLATE_PROP, translate);



export const setFeedLayout = () => action(FeedActionTypes.SET_LAYOUT);

export const resetFeed = () => action(FeedActionTypes.RESET_FEED);

export const setBulkSelect = (feeds: Feed[], selectAllToggle: boolean) =>
  action(FeedActionTypes.BULK_SELECT, {
    feeds,
    selectAllToggle,
  });

export const toggleSelectAll = (flag: boolean) =>
  action(FeedActionTypes.TOGGLE_SELECT_ALL, flag);

export const setAllSelect = (feeds: Feed[]) =>
  action(FeedActionTypes.SET_ALL_SELECT, feeds);

export const removeAllSelect = (feeds: Feed[]) =>
  action(FeedActionTypes.REMOVE_ALL_SELECT, feeds);

export const removeBulkSelect = (feeds: Feed[], selectAllToggle: boolean) =>
  action(FeedActionTypes.REMOVE_BULK_SELECT, {
    feeds,
    selectAllToggle,
  });

export const stopFetchingFeedResources = (feed: Feed) =>
  action(FeedActionTypes.STOP_FETCH_FEED_RESOURCES, feed);

export const cleanupFeedResources = (feed: Feed) =>
  action(FeedActionTypes.CLEANUP_FEED_RESOURCES, feed);

export const setSearchFilter = (value: string) =>
  action(FeedActionTypes.SET_SEARCH_FILTER, value);

export const setShowToolbar = (toolbar: boolean) =>
  action(FeedActionTypes.SHOW_TOOLBAR, toolbar);
