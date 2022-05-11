import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
import { Feed } from "@fnndsc/chrisapi";

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
  downloadError: "",
  downloadStatus: "",
  bulkSelect: [],
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

    case FeedActionTypes.DELETE_FEED: {
      const feedIds = action.payload.map((feed: Feed) => feed.data.id);
      const feedData = state.allFeeds.data?.filter(
        (feed) => !feedIds.includes(feed.data.id)
      );

      action.payload.forEach(async (feed: Feed) => {
        await feed.delete();
      });

      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          data: feedData,
          totalFeedsCount:
            state.allFeeds.totalFeedsCount - action.payload.length,
        },
        bulkSelect: [],
      };
    }

    case FeedActionTypes.DOWNLOAD_FEED_SUCCESS: {
      if (state.allFeeds.data) {
        return {
          ...state,
          allFeeds: {
            ...state.allFeeds,
            data: [...action.payload, ...state.allFeeds.data],
            totalFeedsCount:
              state.allFeeds.totalFeedsCount + action.payload.length,
          },
          bulkSelect: [],
        };
      } else {
        return {
          ...state,
        };
      }
    }

    case FeedActionTypes.DOWNLOAD_FEED_ERROR: {
      return {
        ...state,
        downloadError: action.payload,
      };
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

    case FeedActionTypes.BULK_SELECT: {
      return {
        ...state,
        bulkSelect: [...state.bulkSelect, action.payload],
      };
    }

    case FeedActionTypes.REMOVE_BULK_SELECT: {
      const filteredBulkSelect = state.bulkSelect.filter((feed) => {
        return feed.data.id !== action.payload.data.id;
      });

      return {
        ...state,
        bulkSelect: filteredBulkSelect,
      };
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
