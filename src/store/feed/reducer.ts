import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

export const initialState: IFeedState = {
  allFeeds: [],
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
  bulkSelect: [],
  selectAllToggle: false,
  searchFilter: {
    value: "",
    status: false,
  },
  showToolbar: false,
};

const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_REQUEST: {
      return {
        ...state,
        allFeeds: action.payload,
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

    case FeedActionTypes.SET_LAYOUT: {
      return {
        ...state,
        currentLayout: !state.currentLayout,
      };
    }

    case FeedActionTypes.TRANSLATE_PROP: {
      return {
        ...state,
        feedTreeProp: {
          ...state.feedTreeProp,
          translate: action.payload,
        },
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

    case FeedActionTypes.SET_ALL_SELECT: {
      return {
        ...state,
        bulkSelect: [...action.payload],
      };
    }

    case FeedActionTypes.BULK_SELECT: {
      return {
        ...state,
        bulkSelect: action.payload.feeds,
        selectAllToggle: action.payload.selectAllToggle,
      };
    }

    case FeedActionTypes.REMOVE_BULK_SELECT: {
      return {
        ...state,
        bulkSelect: action.payload.feeds,
        selectAllToggle: action.payload.selectAllToggle,
      };
    }

    case FeedActionTypes.SET_SEARCH_FILTER: {
      return {
        ...state,
        searchFilter: {
          ...state.searchFilter,
          value: action.payload,
          status: !state.searchFilter.status,
        },
      };
    }

    case FeedActionTypes.TOGGLE_SELECT_ALL: {
      return {
        ...state,
        selectAllToggle: action.payload,
      };
    }

    case FeedActionTypes.REMOVE_ALL_SELECT: {
      return {
        ...state,
        bulkSelect: [],
      };
    }

    case FeedActionTypes.SHOW_TOOLBAR: {
      return {
        ...state,
        showToolbar: action.payload,
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
