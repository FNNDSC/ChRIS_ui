import { Reducer } from "redux";
import { IUserState, UserActionTypes } from "./types";


// Type-safe initialState
const initialState: IUserState = {
    username: window.sessionStorage.getItem("USERNAME"),
    token:  window.sessionStorage.getItem("AUTH_TOKEN"),
    isRememberMe: false,
    isLoggedIn: !!window.sessionStorage.getItem("AUTH_TOKEN")
};

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
    switch (action.type) {
        case UserActionTypes.FETCH_TOKEN: {
            return { ...state, username: action.payload.username };
        }
        case UserActionTypes.FETCH_TOKEN_SUCCESS: {
            return { ...state, token: action.payload, isLoggedIn: true };
        }
        case UserActionTypes.FETCH_TOKEN_ERROR: {
            return { ...state, username: null, token: null, isLoggedIn: false  };
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
