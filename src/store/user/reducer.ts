import { produce } from "immer";
import { Cookies } from "react-cookie";
import type { Reducer } from "redux";
import { type IUserState, UserActionTypes } from "./types";

const cookie = new Cookies();
const user = cookie.get("username");
const token = cookie.get(`${user}_token`);
const isStaff = cookie.get("isStaff");

// Type-safe initialState
const initialState: IUserState = {
  username: user,
  token: token,
  isRememberMe: false,
  isLoggedIn: !!token,
  isStaff: !!isStaff,
};

const reducer: Reducer<IUserState, { type: string; payload?: any }> = produce(
  (draft: IUserState, action) => {
    switch (action.type) {
      case UserActionTypes.SET_TOKEN_SUCCESS: {
        draft.username = action.payload.username;
        draft.token = action.payload.token;
        draft.isLoggedIn = true;
        draft.isStaff = action.payload.isStaff;
        break;
      }
      case UserActionTypes.SET_TOKEN_ERROR: {
        draft.username = null;
        draft.token = null;
        draft.isLoggedIn = false;
        draft.isStaff = false;
        break;
      }
      case UserActionTypes.SET_LOGOUT_USER_SUCCESS: {
        draft.username = null;
        draft.token = null;
        draft.isLoggedIn = false;
        draft.isStaff = false;
        break;
      }
      default:
        return draft;
    }
  },
  initialState,
);

export { reducer as userReducer };
