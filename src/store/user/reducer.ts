import { Reducer } from 'redux';
import { IUserState, UserActionTypes } from './types';


// Type-safe initialState
const initialState: IUserState = {
    username: '',
    isRememberMe: false,
    token: undefined
};

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
    switch (action.type) {
        case UserActionTypes.FETCH_TOKEN: {
            console.log('FETCH_TOKEN', action.payload);
            return { ...state, username: action.payload.username };
        }
        case UserActionTypes.FETCH_TOKEN_SUCCESS: {
            console.log('FETCH_TOKEN_SUCCESS', action.payload);
            return { ...state, token: action.payload };
        }
        case UserActionTypes.FETCH_TOKEN_ERROR: {
            return { ...state, items: action.payload.data };
        }

        default: {
            return state;
        }
    }
};

export { reducer as userReducer };
