import { Reducer } from "redux";
import { getWithExpiry } from "../../utils";
import { IUserState, UserActionTypes } from "./types";

// Type-safe initialState
const initialState: IUserState = {
  username: getWithExpiry("USERNAME"),
  token: getWithExpiry("CHRIS_TOKEN"),
  isRememberMe: true,
  isLoggedIn: !!getWithExpiry("CHRIS_TOKEN"),
};

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.SET_TOKEN_SUCCESS: {
      return {
        ...state,
        isRememberMe:action.payload.isRememberMe,
        username: action.payload.username,
        token: action.payload.token,
        isLoggedIn: true,
      };
    }
    case UserActionTypes.SET_TOKEN_ERROR: {
      return { ...state, username: null, token: null, isLoggedIn: false };
    }
    case UserActionTypes.LOGOUT_USER: {
      return { ...state, username: null, token: null, isLoggedIn: false };
    }
    default: {
      return state;
    }
  }
};

export { reducer as userReducer };
