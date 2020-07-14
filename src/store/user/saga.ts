import { all, fork, put, takeEvery } from "redux-saga/effects";
import { push } from "connected-react-router";
import Client from "@fnndsc/chrisapi";
import { UserActionTypes } from "./types";
import { getAuthTokenSuccess } from "./actions";

// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------
//const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
function* handleLogin(action: any) {
  try {
    const authURL = `${process.env.REACT_APP_CHRIS_UI_AUTH_URL}`;
    const username = action.payload.username;
    const password = action.payload.password;
    const token = yield Client.getAuthToken(authURL, username, password);

    if (!token) {
      console.error("Count not set Token"); // working ***** user messaging
    } else {
      yield put(getAuthTokenSuccess(token));
      window.sessionStorage.setItem("AUTH_TOKEN", token);
      window.sessionStorage.setItem("USERNAME", username);
      yield put(push("/"));
    }
  } catch (error) {
    console.error(error); // working user messaging
    yield put(push("/not-found"));
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchLoginRequest() {
  yield takeEvery(UserActionTypes.FETCH_TOKEN, handleLogin);
}

// ----------------------------------------------------------------
// Log user out
function* handleLogout(action: any) {
  window.sessionStorage.removeItem("AUTH_TOKEN");
  window.sessionStorage.removeItem("USERNAME");
  yield put(push("/login"));
}
function* watchLogoutRequest() {
  yield takeEvery(UserActionTypes.LOGOUT_USER, handleLogout);
}
// ----------------------------------------------------------------
// We can also use `fork()` here to split our saga into multiple watchers.
export function* userSaga() {
  yield all([fork(watchLoginRequest), fork(watchLogoutRequest)]);
}
