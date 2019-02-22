import { action } from "typesafe-actions";
import { FeedActionTypes, IItem } from "./types";


// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getFeedDetailsRequest = (id: string) => action(FeedActionTypes.GET_FEED_DETAILS, id);
export const getFeedDetailsSuccess = (items: IItem[]) => action(FeedActionTypes.GET_FEED_DETAILS_SUCCESS, items);


export const getPluginInstanceListRequest = (id: string) => action(FeedActionTypes.GET_PLUGIN_INSTANCES, id);
export const getPluginInstanceListSuccess = (items: IItem[]) => action(FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS, items);

