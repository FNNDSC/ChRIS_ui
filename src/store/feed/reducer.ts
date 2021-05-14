import { Reducer } from "redux";
import { createPartiallyEmittedExpression } from "typescript";
import { IFeedState, FeedActionTypes } from "./types";

export const initialState: IFeedState = {
  allFeeds: {
    data: undefined,
    error: "",
    loading: false,
    totalFeedsCount: 0,
  },
  currentFeed: {
    data: undefined,
    error: "",
    loading: false,
  },
  currentLayout: true,
  feedTreeProp: {
    orientation: "vertical",
    translate: {
      x: 600,
      y: 50,
    },
  },
};

const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_REQUEST: {
      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          loading: true,
        },
      };
    }

    case FeedActionTypes.GET_ALL_FEEDS_SUCCESS: {

      return {
        ...state,
        allFeeds: {
          data: action.payload.feeds,
          error: "",
          loading: false,
          totalFeedsCount: action.payload.totalCount,
        },
      };
    }

    case FeedActionTypes.GET_ALL_FEEDS_ERROR: {
      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          error: action.payload,
        },
      };
    }

    case FeedActionTypes.GET_FEED_REQUEST: {
      return {
        ...state,
        currentFeed: {
          ...state.currentFeed,
          loading: true,
        },
      };
    }

    case FeedActionTypes.GET_FEED_SUCCESS: {
      return {
        ...state,
        currentFeed: {
          data: action.payload,
          error: "",
          loading: false,
        },
      };
    }

    case FeedActionTypes.GET_FEED_ERROR: {
      return {
        ...state,
        currentFeed: {
          ...state.currentFeed,
          error: action.payload,
          loading: false,
        },
      };
    }

    case FeedActionTypes.ADD_FEED: {
      if (state.allFeeds.data && state.allFeeds.totalFeedsCount) {
        return {
          ...state,
          allFeeds: {
            data: [action.payload, ...state.allFeeds.data],
            error: "",
            loading: false,
            totalFeedsCount: state.allFeeds.totalFeedsCount + 1,
          },
        };
      } else {
        return {
          ...state,
          allFeeds: {
            data: [action.payload],
            error: "",
            loading: false,
            totalFeedsCount: state.allFeeds.totalFeedsCount + 1,
          },
        };
      }
    }

    case FeedActionTypes.SET_LAYOUT: {
      return {
        ...state,
        currentLayout: !state.currentLayout,
      };
    }

    case FeedActionTypes.GET_FEED_TREE_PROP: {
      const currentOrientation = action.payload;
      if (currentOrientation === "horizontal")
        return {
          ...state,
          feedTreeProp: {
            ...state.feedTreeProp,
            orientation: "vertical",
          },
        };
      else {
        return {
          ...state,
          feedTreeProp: {
            ...state.feedTreeProp,
            orientation: "horizontal",
          },
        };
      }
    }

    case FeedActionTypes.RESET_FEED: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};

export { reducer as feedsReducer };
