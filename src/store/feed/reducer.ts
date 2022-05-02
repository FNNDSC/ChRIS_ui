import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
import { Feed } from "@fnndsc/chrisapi"


export const initialState: IFeedState = {
  allFeeds: {
    data: undefined,
    error: "",
    loading: false,
    totalFeedsCount: 0,
    cu: undefined,
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

  switch  (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_REQUEST: {

      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          loading: true,
          cu: action.payload.cu,
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
          cu: action.payload.cu,

        },
      };
    }

    case FeedActionTypes.GET_ALL_FEEDS_ERROR: {
      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          error: action.payload,
          cu: action.payload.cu,
        },
      };
    }

    case FeedActionTypes.GET_FEED_REQUEST: {
      return {
        ...state,
        currentFeed: {
          ...state.currentFeed,
          loading: true,
          cu: action.payload.cu,
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
          cu: action.payload.cu,
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
          cu: action.payload.cu,
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
            cu: action.payload.cu,
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
            cu: action.payload.cu,
          },
        };
      }
    }

    case FeedActionTypes.DELETE_FEED: {
      const feedData = state.allFeeds.data?.filter(
        (feed) => feed.data.id !== action.payload.data.id
      );
      action.payload.delete();
      return {
        ...state,
        allFeeds: {
          ...state.allFeeds,
          data: feedData,
          totalFeedsCount: state.allFeeds.totalFeedsCount - 1,
          cu: action.payload.cu,
        },
      };
    }
    
    case FeedActionTypes.DOWNLOAD_FEED: {

      const feedData = state.allFeeds.data?.filter(
        (feed) => feed.data.id !== action.payload.data.id
      );

      const downloader= state.allFeeds.cu;
      const feedName = "Download of "+ action.payload.data.name;
      const downloadingFeed = downloader.downloadFeed(action.payload.data.id,feedName);

      
     
      if (state.allFeeds.data && state.allFeeds.totalFeedsCount) {
        
        return {
          ...state,
          allFeeds: {
            data: [action.payload, ...state.allFeeds.data],
            error: "",
            loading: false,
            totalFeedsCount: state.allFeeds.totalFeedsCount + 1,
            cu: action.payload.cu,
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
            cu: action.payload.cu,
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
