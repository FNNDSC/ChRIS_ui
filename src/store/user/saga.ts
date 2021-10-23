import { all, fork, put, takeEvery } from "redux-saga/effects";
import { UserActionTypes } from "./types";
import { setAuthError, setAuthTokenSuccess } from "./actions";
import { setWithExpiry } from "../../utils";



// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------

function* handleResponse(action: any) {
  try {
    yield put(
      setAuthTokenSuccess({
        token: action.payload.token,
        username: action.payload.username,
        isRememberMe: action.payload.isRememberMe
      })
    );
    if(action.payload.isRememberMe){
      setWithExpiry("CHRIS_TOKEN", action.payload.token, 43200 * 60 * 1000); //miliseconds for 30 days
      setWithExpiry("USERNAME", action.payload.username, 43200 * 60 * 1000);
    }else{
      setWithExpiry("CHRIS_TOKEN", action.payload.token, 1440 * 60 * 1000); //miliseconds for 24hr
      setWithExpiry("USERNAME", action.payload.username, 1440 * 60 * 1000);
    }

  } catch (error) {
    setAuthError();
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchLoginRequest() {
  yield takeEvery(UserActionTypes.SET_TOKEN, handleResponse);
}

// ----------------------------------------------------------------

function handleLogout() {
  window.localStorage.removeItem("CHRIS_TOKEN");
  window.localStorage.removeItem("USERNAME");
}
function* watchLogoutRequest() {
  yield takeEvery(UserActionTypes.LOGOUT_USER, handleLogout);
}

// ----------------------------------------------------------------

export function* userSaga() {
  yield all([fork(watchLoginRequest), fork(watchLogoutRequest)]);
}
