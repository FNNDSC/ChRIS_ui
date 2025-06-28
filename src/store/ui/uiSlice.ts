import type { NavExpandable } from "@patternfly/react-core";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FormEvent, MutableRefObject } from "react";

// Description: state for UI Manager
export interface IUiState {
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
  isTagExpanded: boolean;
  onTagToggle: (e: FormEvent) => void;
  isPackageTagExpanded: boolean;
  onPackageTagToggle: (e: FormEvent) => void;
}

const initialState: IUiState = {
  sidebarActiveItem: "overview",
  isNavOpen: true, // default
  isTagExpanded: false,
  onTagToggle: () => {},
  isPackageTagExpanded: false,
  onPackageTagToggle: () => {},
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
    setIsTagExpanded(state, action: PayloadAction<boolean>) {
      state.isTagExpanded = action.payload;
    },
    setIsPackageTagExpanded(state, action: PayloadAction<boolean>) {
      state.isPackageTagExpanded = action.payload;
    },
  },
});

export const {
  setIsNavOpen,
  setSidebarActive,
  setIsTagExpanded,
  setIsPackageTagExpanded,
} = uiSlice.actions;

export default uiSlice.reducer;
