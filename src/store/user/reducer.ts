import { Reducer } from 'redux'
import { IUserState, UserActionTypes } from './types'
import { Cookies } from 'react-cookie'

const cookie = new Cookies()
const user = cookie.get('username')
const token = cookie.get(`${user}_token`)

// Type-safe initialState
const initialState: IUserState = {
  username: user,
  token: token,
  isRememberMe: false,
  isLoggedIn: token ? true : false,
}

// ***** NOTE: Working *****
const reducer: Reducer<IUserState> = (state = initialState, action) => {
  switch (action.type) {
    case UserActionTypes.SET_TOKEN_SUCCESS: {
      return {
        ...state,
        username: action.payload.username,
        token: action.payload.token,
        isLoggedIn: true,
      }
    }
    case UserActionTypes.SET_TOKEN_ERROR: {
      return { ...state, username: null, token: null, isLoggedIn: false }
    }
    case UserActionTypes.LOGOUT_USER: {
      return { ...state, username: null, token: null, isLoggedIn: false }
    }
    default: {
      return state
    }
  }
}

export { reducer as userReducer }
