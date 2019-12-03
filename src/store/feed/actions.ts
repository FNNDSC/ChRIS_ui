import { action } from "typesafe-actions";
import { FeedActionTypes } from "./types";
import { IFeedItem } from "../../api/models/feed.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";

// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getAllFeedsRequest = (
  name?: string,
  limit?: number,
  offset?: number
) => action(FeedActionTypes.GET_ALL_FEEDS, { name, limit, offset });
export const getAllFeedsSuccess = (feeds: IFeedItem[]) =>
  action(FeedActionTypes.GET_ALL_FEEDS_SUCCESS, feeds);

export const getFeedDetailsRequest = (id: string) =>
  action(FeedActionTypes.GET_FEED_DETAILS, id);
export const getFeedDetailsSuccess = (items: IFeedItem) =>
  action(FeedActionTypes.GET_FEED_DETAILS_SUCCESS, items);

export const getPluginInstanceListRequest = (url: string) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES, url);
export const getPluginInstanceListSuccess = (items: IPluginItem[]) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS, items);

export const destroyFeed = () => action(FeedActionTypes.RESET_STATE);

export const addFeed = (feed: IFeedItem) =>
  action(FeedActionTypes.ADD_FEED, feed);

export const addNode = (pluginItem: IPluginItem) =>
  action(FeedActionTypes.ADD_NODE, pluginItem);

export const getAllFiles = () => action(FeedActionTypes.GET_ALL_FILES);
