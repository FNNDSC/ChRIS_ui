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
    FETCH_TOKEN: null, // before request
    FETCH_TOKEN_ERROR: null, // request failed
    FETCH_TOKEN_SUCCESS: null, // request is successful
    LOGOUT_USER: null
});


