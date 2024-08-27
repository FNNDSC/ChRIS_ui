import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Description: state for UI Manager
export interface IUiState {
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
}

const initialState: IUiState = {
  sidebarActiveItem: "overview",
  isNavOpen: true, // default
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setIsNavOpen(state, action: PayloadAction<boolean>) {
      state.isNavOpen = action.payload;
    },
    setSidebarActive(state, action: PayloadAction<{ activeItem: string }>) {
      state.sidebarActiveItem = action.payload.activeItem;
    },
  },
});

export const { setIsNavOpen, setSidebarActive } = uiSlice.actions;

export default uiSlice.reducer;
