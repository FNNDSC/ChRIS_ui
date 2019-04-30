import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

// Type-safe initialState
const initialState: IFeedState = {
  details: undefined,
  items: undefined,
  feeds: undefined
};

const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_SUCCESS: {
      return { ...state, feeds: action.payload.data.results }; // Using the ChrisModel
    }
    case FeedActionTypes.GET_FEED_DETAILS_SUCCESS: {  // Using the ChrisModel
      return { ...state, details: action.payload };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: { // Using the ChrisModel
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.RESET_STATE: {
      return { ...state, items: undefined, details: undefined };
    }
    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
