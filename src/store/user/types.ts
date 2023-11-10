/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing Chris API feed calls
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/
import keyMirror from "keymirror";

// Description state for main user items[] and item
export interface IUserState {
    username?: string | null;
    password?: string;
    email?: string;
    token?: string | null;
    isRememberMe?: boolean;
    isLoggedIn?: boolean;
}

export const UserActionTypes = keyMirror({
  SET_TOKEN: null, // before request
  SET_TOKEN_ERROR: null, // request failed
  SET_TOKEN_SUCCESS: null, // request is successful
  LOGOUT_USER: null,
  GET_AUTH_TOKEN: null,
  GET_AUTH_TOKEN_SUCCESS: null,
});


