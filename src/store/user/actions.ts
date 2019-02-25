import { action } from "typesafe-actions";
import { UserActionTypes, IUserState } from "./types";

// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const getAuthToken = (user: IUserState) => action(UserActionTypes.FETCH_TOKEN, user);
export const getAuthTokenSuccess = (token: string) => action(UserActionTypes.FETCH_TOKEN_SUCCESS, token); // NOTE: To be done: Save user token to cookie or session

export const setUserLogout = () => action(UserActionTypes.LOGOUT_USER);
