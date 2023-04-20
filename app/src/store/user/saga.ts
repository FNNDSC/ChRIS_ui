import { all, fork, put, takeEvery } from 'redux-saga/effects'
import { UserActionTypes } from './types'
import { setAuthError, setAuthTokenSuccess } from './actions'
import { Cookies } from 'react-cookie'
import { IActionTypeParam } from '../../api/models/base.model'

// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------

function* handleResponse(action: any) {
  try {
    yield put(
      setAuthTokenSuccess({
        token: action.payload.token,
        username: action.payload.username,
      }),
    )
  } catch (error) {
    setAuthError()
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchLoginRequest() {
  yield takeEvery(UserActionTypes.SET_TOKEN, handleResponse)
}

// ----------------------------------------------------------------

function handleLogout(action: IActionTypeParam) {
  const cookie = new Cookies()

  cookie.remove(`${action.payload}_token`)
  cookie.remove('username')
  localStorage.removeItem('tooltip')
}
function* watchLogoutRequest() {
  yield takeEvery(UserActionTypes.LOGOUT_USER, handleLogout)
}

// ----------------------------------------------------------------

export function* userSaga() {
  yield all([fork(watchLoginRequest), fork(watchLogoutRequest)])
}
