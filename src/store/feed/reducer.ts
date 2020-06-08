import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

// Type-safe initialState
const initialState: IFeedState = {
  details: undefined,
  items: undefined,
  feeds: undefined,
  feedsCount: 0,
  uploadedFiles: undefined,
};

const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_SUCCESS: {
      return {
        ...state,
        feeds: action.payload.data,
        feedsCount: action.payload.totalCount,
      };
    }
    case FeedActionTypes.GET_FEED_DETAILS_SUCCESS: {
      return { ...state, details: action.payload };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.RESET_STATE: {
      return { ...state, items: undefined, details: undefined };
    }
    case FeedActionTypes.ADD_FEED: {
      if (state.feeds) {
        return { ...state, feeds: [action.payload, ...state.feeds] };
      } else {
        return { ...state, feeds: [action.payload] };
      }
    }
    case FeedActionTypes.GET_UPLOADED_FILES_SUCCESS: {
      return { ...state, uploadedFiles: action.payload };
    }

    case FeedActionTypes.ADD_NODE: {
      if (state.items) {
        return { ...state, items: [...state.items, action.payload] };
      }
      return { ...state, items: [action.payload] };
    }

    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
