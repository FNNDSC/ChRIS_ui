import { Reducer } from 'redux';
import { IUserState, UserActionTypes } from './types';


// Type-safe initialState
const initialState: IUserState = {
    username: window.sessionStorage.getItem('USERNAME'),
    token:  window.sessionStorage.getItem('AUTH_TOKEN'),
    isRememberMe: false,
};

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
    switch (action.type) {
        case UserActionTypes.FETCH_TOKEN: {
            return { ...state, username: action.payload.username };
        }
        case UserActionTypes.FETCH_TOKEN_SUCCESS: {
            return { ...state, token: action.payload };
        }
        case UserActionTypes.FETCH_TOKEN_ERROR: {
            return { ...state, items: action.payload.data };
        }
        case UserActionTypes.LOGOUT_USER: {
            return { ...state, username: null, token: null };
        }

        default: {
            return state;
        }
    }
};

export { reducer as userReducer };
