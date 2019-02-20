import { action } from 'typesafe-actions';
import { FeedActionTypes, IItem } from './types';


// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getPluginInstanceListRequest = (id: string) => action(FeedActionTypes.FETCH_REQUEST, id);
export const getPluginInstanceListSuccess = (items: IItem[]) => action(FeedActionTypes.FETCH_SUCCESS, items);

