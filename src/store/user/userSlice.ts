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

const cookie = new Cookies();
const user = cookie.get("username");
const token = cookie.get(`${user}_token`);
const isStaff = cookie.get("isStaff");

const initialState: IUserState = {
  username: user,
  token: token,
  isRememberMe: false,
  isLoggedIn: !!token,
  isStaff: !!isStaff,
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
