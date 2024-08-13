import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Description: state for UI Manager
export interface IUiState {
  loading?: boolean;
  progress?: number;
  isDropdownOpen?: boolean;
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
}

const initialState: IUiState = {
  loading: false,
  progress: 0,
  isDropdownOpen: false,
  sidebarActiveItem: "overview",
  isNavOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    onSidebarToggle(state, action: PayloadAction<boolean>) {
      state.isDropdownOpen = action.payload;
    },
    setIsNavOpen(state, action: PayloadAction<boolean>) {
      state.isNavOpen = action.payload;
    },
    setSidebarActive(state, action: PayloadAction<{ activeItem: string }>) {
      state.sidebarActiveItem = action.payload.activeItem;
    },
    onDropdownSelect(state, action: PayloadAction<boolean>) {
      state.isDropdownOpen = action.payload;
    },
  },
});

export const {
  onSidebarToggle,
  setIsNavOpen,
  setSidebarActive,
  onDropdownSelect,
} = uiSlice.actions;

export default uiSlice.reducer;
