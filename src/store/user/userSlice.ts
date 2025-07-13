import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Cookies } from "react-cookie";

export enum Role {
  Clinician = "a clinician",
  Clinician2 = "a clinician2",
  Researcher = "a researcher",
  Researcher2 = "a researcher2",
  Admin = "an admin",
  Admin2 = "an admin2",
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export interface IUserState {
  username?: string | null;
  password?: string;
  email?: string;
  token?: string | null;
  isRememberMe?: boolean;
  isLoggedIn?: boolean;
  isStaff?: boolean;

  role?: Role;
}

const cookie = new Cookies();
const username = cookie.get("username");
const token = cookie.get(`${username}_token`);
const isStaff = cookie.get("isStaff");
const role = isStaff ? Role.Admin : Role.Researcher;

const initialState: IUserState = {
  username: username,
  token: token,
  isRememberMe: false,
  isLoggedIn: !!token,
  isStaff: !!isStaff,
  role: role,
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
      if (action.payload.isStaff) {
        state.role = Role.Admin;
      }
    },
    setRole: (state, action: PayloadAction<{ role: Role }>) => {
      const { role } = action.payload;
      console.info("userSlice.setRole: role:", role, "isStaff:", state.isStaff);
      if (!state.isStaff && role === Role.Admin) {
        return;
      }

      state.role = role;
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
  setRole,
} = userSlice.actions;

export default userSlice.reducer;
