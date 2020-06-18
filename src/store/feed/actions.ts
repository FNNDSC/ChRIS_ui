import { action } from "typesafe-actions";
import { FeedActionTypes } from "./types";

import { UploadedFile, Feed, PluginInstance } from "@fnndsc/chrisapi";

// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getAllFeedsRequest = (
  name?: string,
  limit?: number,
  offset?: number
) => action(FeedActionTypes.GET_ALL_FEEDS, { name, limit, offset });
export const getAllFeedsSuccess = (feeds: Feed[]) =>
  action(FeedActionTypes.GET_ALL_FEEDS_SUCCESS, feeds);

export const getFeedRequest = (id: string) =>
  action(FeedActionTypes.GET_FEED, id);
export const getFeedSuccess = (item: Feed) =>
  action(FeedActionTypes.GET_FEED_SUCCESS, item);

export const getPluginInstanceListRequest = (feed: Feed) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES, feed);
export const getPluginInstanceListSuccess = (items: PluginInstance[]) =>
  action(FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS, items);

export const destroyFeed = () => action(FeedActionTypes.RESET_STATE);

export const addFeed = (feed: Feed) => action(FeedActionTypes.ADD_FEED, feed);

export const addNode = (pluginItem: PluginInstance) =>
  action(FeedActionTypes.ADD_NODE, pluginItem);

export const getUploadedFiles = () =>
  action(FeedActionTypes.GET_UPLOADED_FILES);
export const getUploadedFilesSuccess = (files: UploadedFile) =>
  action(FeedActionTypes.GET_UPLOADED_FILES_SUCCESS, files);
