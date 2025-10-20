import {
  init as _init,
  genUUID,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import queryString from "query-string";
import { Cookies } from "react-cookie";
import { refreshCookie } from "../api/api";
import { STATUS_OK } from "../api/constants";
import {
  createUser as apiCreateUser,
  getAuthToken,
  getUser,
  getUserID,
} from "../api/serverApi";
import { Role } from "./types";

export const myClass = "chris-ui/user";

export interface State extends rState {
  username: string;
  email: string;
  token: string;

  isRememberMe: boolean;
  isLoggedIn: boolean;
  isStaff: boolean;

  role: Role;

  errmsg?: string;
}

export const defaultState: State = {
  username: "",
  email: "",
  token: "",

  isRememberMe: false,
  isLoggedIn: false,
  isStaff: false,

  role: Role.Guest,
};

export const init = (): Thunk<State> => {
  const myID = genUUID();

  return async (dispatch, _) => {
    const cookie = new Cookies();
    const username = cookie.get("username") || "";
    const token = cookie.get(`${username}_token`) || "";
    const isStaff = cookie.get("isStaff") || false;
    let role = Role.DefaultRole;

    let isLoggedIn = false;

    if (username) {
      role = isStaff ? Role.Admin : Role.Researcher;
      const userID = await getUserID();
      isLoggedIn = !!userID;
    }

    console.info(
      "user.init: username:",
      username,
      "token:",
      token,
      "isStaff:",
      isStaff,
      "role:",
      role,
    );

    const state: State = Object.assign({}, defaultState, {
      username,
      token,
      isStaff,
      role,
      isLoggedIn,
    });

    dispatch(_init({ myID, state }));
  };
};

export const login = (
  myID: string,
  username: string,
  password: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    if (!username) {
      dispatch(setData(myID, { errmsg: "Invalid Credentials" }));
      return;
    }

    const { status, data, errmsg } = await getAuthToken(username, password);
    if (errmsg) {
      dispatch(setData(myID, { errmsg }));
      return;
    }
    if (!data) {
      dispatch(setData(myID, { errmsg: "unable to get data" }));
      return;
    }

    const { token } = data;

    if (!token || !username) {
      dispatch(setData(myID, { errmsg: "Invalid Credentials" }));
      return;
    }

    const cookie = new Cookies();
    const options = { path: "/", maxAge: 86400 };
    cookie.set(`${username}_token`, token, options);
    cookie.set("username", username, options);
    refreshCookie();

    const userID = await getUserID();
    if (!userID) {
      dispatch(setData(myID, { errmsg: "Unable to get user id" }));
      return;
    }

    const {
      status: status2,
      data: data2,
      errmsg: errmsg2,
    } = await getUser(userID);
    if (status !== STATUS_OK) {
      dispatch(setData(myID, { errmsg: "Unable to get user info" }));
      return;
    }
    if (!data2) {
      dispatch(setData(myID, { errmsg: "Unable to get user info" }));
      return;
    }

    const { is_staff: isStaff } = data2;
    cookie.set("isStaff", isStaff, options);
    refreshCookie();

    dispatch(setAuthTokenSuccess(myID, token, username, isStaff));

    const { redirectTo: propsRedirectTo } = queryString.parse(
      window.location.search,
    ) as {
      redirectTo: string;
    };

    const redirectTo = propsRedirectTo || "/";
    const decodedRedirectTo = decodeURIComponent(redirectTo);
    window.location.href = decodedRedirectTo;
  };
};

export const setAuthTokenSuccess = (
  myID: string,
  token: string,
  username: string,
  isStaff: boolean,
): Thunk<State> => {
  return async (dispatch, _) => {
    const role = isStaff ? Role.Admin : Role.Researcher;
    const toUpdate = { token, username, isStaff, role, isLoggedIn: true };
    dispatch(setData(myID, toUpdate));
  };
};

export const setRole = (myID: string, role: Role): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const state = getState(classState, myID);
    if (!state) {
      return;
    }
    if (!state.isStaff && role === Role.Admin) {
      return;
    }
    dispatch(setData(myID, { role }));
  };
};

export const setUserLogout = (myID: string): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const state = getState(classState, myID);
    if (!state) {
      return;
    }

    const username = state.username;
    const cookie = new Cookies();
    cookie.remove("username");
    cookie.remove(`${username}_token`);
    cookie.remove("isStaff");
    refreshCookie();

    const toUpdate = {
      username: "",
      token: "",
      isLoggedIn: false,
      isStaff: false,
      role: Role.DefaultRole,
    };

    dispatch(setData(myID, toUpdate));
  };
};

export const createUser = (
  myID: string,
  username: string,
  password: string,
  email: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    const {
      status,
      data: user,
      errmsg,
    } = await apiCreateUser(username, password, email);

    const {
      status: status2,
      data,
      errmsg: errmsg2,
    } = await getAuthToken(username, password);

    if (!data) {
      return;
    }
    const { token } = data;

    if (!user || !token) {
      return;
    }

    const { username: username2, is_staff: isStaff } = user;

    const cookie = new Cookies();
    const options = { path: "/", maxAge: 86400 };
    cookie.set(`${username2}_token`, token, options);
    cookie.set("username", username2, options);
    cookie.set("isStaff", isStaff, options);
    refreshCookie();

    dispatch(setAuthTokenSuccess(myID, token, username2, isStaff));

    const theThen = new URLSearchParams(location.search).get("then");

    if (theThen) {
      window.location.href = theThen;
    } else {
      window.location.href = "/";
    }
  };
};
