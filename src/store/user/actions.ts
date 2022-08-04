import { action } from 'typesafe-actions'
import { UserActionTypes } from './types'

// type them properly as well -> For more info: https://github.com/piotrwitek/typesafe-actions
export const setAuthToken = (auth: { token: string; username: string }) =>
  action(UserActionTypes.SET_TOKEN, auth)
export const setAuthTokenSuccess = (auth: {
  token: string
  username: string
}) => action(UserActionTypes.SET_TOKEN_SUCCESS, auth) // NOTE: To be done: Save user token to cookie or session
export const setUserLogout = (username: string) =>
  action(UserActionTypes.LOGOUT_USER, username)
export const setAuthError = () => action(UserActionTypes.SET_TOKEN_ERROR)
