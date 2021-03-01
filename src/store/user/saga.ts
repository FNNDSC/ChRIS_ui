import { all, fork, put, takeEvery } from "redux-saga/effects";
import { UserActionTypes } from "./types";
import { setAuthError, setAuthTokenSuccess } from "./actions";
import history from "../../utils";

// ----------------------------------------------------------------
// Description: List - Get all Users
// ----------------------------------------------------------------

function* handleResponse(action: any) {
  try {
    yield put(
      setAuthTokenSuccess({
        token: action.payload.token,
        username: action.payload.username,
      })
    );
    window.sessionStorage.setItem("AUTH_TOKEN", action.payload.token);
    window.sessionStorage.setItem('USERNAME',action.payload.username)

    history.push("/");
  } catch (error) {
    setAuthError();
    history.push("/not-found");
  }
}

// This is our watcher function. We use `take*()` functions to watch Redux for a specific action
// type, and run our saga, for example the `handleFetch()` saga above.
function* watchLoginRequest() {
  yield takeEvery(UserActionTypes.SET_TOKEN, handleResponse);
}

// ----------------------------------------------------------------

function handleLogout() {
  window.sessionStorage.removeItem("AUTH_TOKEN");
  window.sessionStorage.removeItem("USERNAME");
  history.push("/login");
}
function* watchLogoutRequest() {
  yield takeEvery(UserActionTypes.LOGOUT_USER, handleLogout);
}

// ----------------------------------------------------------------

export function* userSaga() {
  yield all([fork(watchLoginRequest), fork(watchLogoutRequest)]);
}
