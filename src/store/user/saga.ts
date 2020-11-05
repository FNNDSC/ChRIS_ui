import { all, fork, put, takeEvery } from "redux-saga/effects";

import { UserActionTypes } from "./types";
import { setAuthTokenSuccess } from "./actions";
import history from "../../utils";

// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------
//const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
function* handleLogin(action: any) {
        try {
          yield put(setAuthTokenSuccess(action.payload.token));
          console.log("Token", action.payload.token);
          window.sessionStorage.setItem("AUTH_TOKEN", action.payload.token);
          window.sessionStorage.setItem("USERNAME", action.payload.username);
          history.push("/");
        } catch (error) {
          console.error(error); // working user messaging
          history.push("/not-found");
        }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchLoginRequest() {
  yield takeEvery(UserActionTypes.SET_TOKEN, handleLogin);
}

// ----------------------------------------------------------------
// Log user out
function handleLogout(action: any) {
  window.sessionStorage.removeItem("AUTH_TOKEN");
  window.sessionStorage.removeItem("USERNAME");
  history.push("/login");
}
function* watchLogoutRequest() {
  yield takeEvery(UserActionTypes.LOGOUT_USER, handleLogout);
}
// ----------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* userSaga() {
  yield all([fork(watchLoginRequest), fork(watchLogoutRequest)]);
}
