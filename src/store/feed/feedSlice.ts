import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IFeedState } from "./types";
import type { Feed } from "@fnndsc/chrisapi";

// Define the initial state
const initialState: IFeedState = {
  currentFeed: {
    data: undefined,
    error: "",
    loading: false,
  },
  currentLayout: false,
  feedTreeProp: {
    orientation: "vertical",
    translate: {
      x: 0,
      y: 0,
    },
  },
  searchFilter: {
    value: "",
    status: false,
  },
  showToolbar: false,
};

// Create a slice
const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    getFeedSuccess(state, action: PayloadAction<Feed | undefined>) {
      state.currentFeed.data = action.payload;
      state.currentFeed.error = "";
      state.currentFeed.loading = false;
    },
    setFeedTreeProp(state, action: PayloadAction<string>) {
      const currentOrientation = action.payload;
      state.feedTreeProp.orientation =
        currentOrientation === "horizontal" ? "vertical" : "horizontal";
    },
    setTranslate(state, action: PayloadAction<{ x: number; y: number }>) {
      state.feedTreeProp.translate = action.payload;
    },
    setFeedLayout(state) {
      state.currentLayout = !state.currentLayout;
    },
    resetFeed(_state) {
      return initialState;
    },
    setSearchFilter(state, action: PayloadAction<string>) {
      state.searchFilter.value = action.payload;
      state.searchFilter.status = !state.searchFilter.status;
    },
    setShowToolbar(state, action: PayloadAction<boolean>) {
      state.showToolbar = action.payload;
    },
  },
});

// Export the actions
export const {
  getFeedSuccess,
  setFeedTreeProp,
  setTranslate,
  setFeedLayout,
  resetFeed,
  setSearchFilter,
  setShowToolbar,
} = feedSlice.actions;

// Export the reducer
export default feedSlice.reducer;
