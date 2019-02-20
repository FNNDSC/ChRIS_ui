import { action } from 'typesafe-actions';
import { UserActionTypes, IUserState } from './types';


// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getAuthToken = (id: IUserState) => action(UserActionTypes.FETCH_TOKEN, id);
export const getAuthTokenSuccess = (user: any) => action(UserActionTypes.FETCH_TOKEN_SUCCESS, user);

