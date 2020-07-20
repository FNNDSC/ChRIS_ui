import { action } from "typesafe-actions";
import { FeedActionTypes } from "./types";

import { Feed, PluginInstance } from "@fnndsc/chrisapi";

// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getAllFeedsRequest = (
  name?: string,
  limit?: number,
  offset?: number
) => action(FeedActionTypes.GET_ALL_FEEDS, { name, limit, offset });
export const getAllFeedsSuccess = (feeds: Feed[]) =>
  action(FeedActionTypes.GET_ALL_FEEDS_SUCCESS, feeds);
export const getFeedRequest = (id: string) =>
  action(FeedActionTypes.GET_FEED_REQUEST, id);
export const getFeedSuccess = (item: Feed) =>
  action(FeedActionTypes.GET_FEED_SUCCESS, item);
export const getSelectedPlugin = (item: PluginInstance) =>
  action(FeedActionTypes.GET_SELECTED_PLUGIN, item);
export const getPluginInstancesRequest = (feed: Feed) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES_REQUEST, feed);
export const getPluginInstancesSuccess = (items: PluginInstance[]) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS, items);
export const destroyFeedState = () => action(FeedActionTypes.RESET_FEED_STATE);
export const addFeed = (feed: Feed) => action(FeedActionTypes.ADD_FEED, feed);
export const addNode = (pluginItem: PluginInstance) =>
  action(FeedActionTypes.ADD_NODE, pluginItem);
export const addNodeSuccess = (pluginItem: PluginInstance) =>
  action(FeedActionTypes.ADD_NODE_SUCCESS, pluginItem);
