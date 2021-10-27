import { Reducer } from "redux";
import { IUserState, UserActionTypes } from "./types";


// Type-safe initialState
const initialState: IUserState = {
  username: window.localStorage.getItem("USERNAME"),
  token: window.localStorage.getItem("CHRIS_TOKEN"),
  isRememberMe: false,
  isLoggedIn: !!window.localStorage.getItem("CHRIS_TOKEN"),
};

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.SET_TOKEN_SUCCESS: {
      return {
        ...state,
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
