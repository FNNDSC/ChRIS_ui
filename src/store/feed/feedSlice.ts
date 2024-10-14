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
    setShowToolbar(state, action: PayloadAction<boolean>) {
      state.showToolbar = action.payload;
    },

    resetFeed(_state) {
      return initialState;
    },
  },
});

// Export the actions
export const { getFeedSuccess, resetFeed, setShowToolbar } = feedSlice.actions;

// Export the reducer
export default feedSlice.reducer;
