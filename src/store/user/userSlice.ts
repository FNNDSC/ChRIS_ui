import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Cookies } from "react-cookie";

export interface IUserState {
  username?: string | null;
  password?: string;
  email?: string;
  token?: string | null;
  isRememberMe?: boolean;
  isLoggedIn?: boolean;
  isStaff?: boolean;
}

// Improved cookie retrieval function that handles potential inconsistencies
const getAuthStateFromCookies = () => {
  const cookie = new Cookies();
  const username = cookie.get("username");

  // Only attempt to get token if username exists
  let token = null;
  if (username) {
    token = cookie.get(`${username}_token`);
  }

  const isStaff = cookie.get("isStaff");
  const isLoggedIn = !!(username && token);

  return {
    username,
    token,
    isStaff: !!isStaff,
    isLoggedIn,
  };
};

const cookieState = getAuthStateFromCookies();

const initialState: IUserState = {
  username: cookieState.username,
  token: cookieState.token,
  isRememberMe: false,
  isLoggedIn: cookieState.isLoggedIn,
  isStaff: cookieState.isStaff,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthTokenSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        username: string;
        isStaff: boolean;
      }>,
    ) => {
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.isStaff = action.payload.isStaff;
    },
    setUserLogout: (state) => {
      state.username = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isStaff = false;
    },
    setLogoutSuccess: (state) => {
      state.username = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isStaff = false;
    },
    setAuthError: (state) => {
      state.username = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isStaff = false;
    },
  },
});

export const {
  setAuthTokenSuccess,
  setUserLogout,
  setLogoutSuccess,
  setAuthError,
} = userSlice.actions;

export default userSlice.reducer;
