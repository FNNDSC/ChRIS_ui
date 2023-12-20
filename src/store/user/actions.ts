import { action } from "typesafe-actions";
import { UserActionTypes } from "./types";

export const setAuthTokenSuccess = (auth: {
  token: string;
  username: string;
}) => action(UserActionTypes.SET_TOKEN_SUCCESS, auth); // NOTE: To be done: Save user token to cookie or session
export const setUserLogout = (username: string) =>
  action(UserActionTypes.LOGOUT_USER, username);

export const setLogoutSuccess = () =>
  action(UserActionTypes.SET_LOGOUT_USER_SUCCESS);
export const setAuthError = () => action(UserActionTypes.SET_TOKEN_ERROR);
