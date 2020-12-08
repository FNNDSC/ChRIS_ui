import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
import { UserActionTypes } from "../user/types";
import { PluginInstance } from "@fnndsc/chrisapi";

// Type-safe initialState
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
    loading:false
  },
  pluginInstances: [],
  selected: undefined,
  deleteNodeSuccess: false,
  testStatus: {},
};

const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {

    case FeedActionTypes.GET_ALL_FEEDS_REQUEST:{
      return {
        ...state,
        allFeeds:{
          ...state.allFeeds,
          loading:true
        }
      }
    }

    case FeedActionTypes.GET_ALL_FEEDS_SUCCESS: {
      return {
        ...state,
        allFeeds: {
          data: action.payload.data,
          error: "",
          loading: false,
          totalFeedsCount: action.payload.totalCount,
        },
      };
    }

    case FeedActionTypes.GET_ALL_FEEDS_ERROR:{
      return {
        ...state,
        allFeeds:{
          ...state.allFeeds,
          error:action.payload
        }
      }
    }

    case FeedActionTypes.GET_FEED_REQUEST:{
      return {
        ...state,
        currentFeed:{
          ...state.currentFeed,
          loading:true
        }
      }
    }


    case FeedActionTypes.GET_FEED_SUCCESS: {
      return { ...state, 
      currentFeed:{
        data:action.payload,
        error:'',
        loading:false,
        
      }
    };
  }


  case FeedActionTypes.GET_FEED_ERROR:{
    return {
      ...state,
      currentFeed:{
        ...state.currentFeed,
        error:action.payload
      }
    }
  }


    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      return {
        ...state,
        selected: action.payload.selected,
        pluginInstances: action.payload.pluginInstances,
      };
    }
    case FeedActionTypes.RESET_FEED_STATE: {
      return {
        ...state,
        pluginInstances: [],
        selected:undefined,
        deleteNodeSuccess:false,
        testStatus:{},
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
      };
    }
    case FeedActionTypes.ADD_FEED: {
      if (state.allFeeds.data && state.allFeeds.totalFeedsCount) {
        return {
          ...state,
          allFeeds:{
            data:[action.payload,...state.allFeeds.data],
            error:'',
            loading:false,
            totalFeedsCount:state.allFeeds.totalFeedsCount+1
          }
        };
      } else {
        return {
          ...state,
         allFeeds:{
           data:[action.payload],
           error:'',
           loading:false,
           totalFeedsCount:state.allFeeds.totalFeedsCount+1
         } 
        };
      }
    }
    case FeedActionTypes.GET_SELECTED_PLUGIN: {
      return {
        ...state,
        selected: action.payload,
      };
    }
    case FeedActionTypes.ADD_NODE_SUCCESS: {
      if (state.pluginInstances) {
        const sortedPluginList = [
          ...state.pluginInstances,
          action.payload,
        ].sort((a: PluginInstance, b: PluginInstance) => {
          return b.data.id - a.data.id;
        });
        return {
          ...state,
          pluginInstances: sortedPluginList,
        };
      } else
        return {
          ...state,
          pluginInstances: [action.payload],
        };
    }

    case FeedActionTypes.DELETE_NODE_SUCCESS: {
      return {
        ...state,
        deleteNodeSuccess: !state.deleteNodeSuccess,
      };
    }

    case UserActionTypes.LOGOUT_USER: {
      return {
        ...state,
        feed: undefined,
        feeds: undefined,
        feedsCount: 0,
        pluginInstances: [],
        selected: undefined,
      };
    }

    case FeedActionTypes.GET_TEST_STATUS: {
      const instance = action.payload;

      return {
        ...state,
        testStatus: {
          ...state.testStatus,
          [instance.data.id]: action.payload.data.status,
        },
      };;
    }

    case FeedActionTypes.STOP_FETCHING_PLUGIN_RESOURCES:{
      const id=`${action.payload}` 
      let newObject = Object.entries(state.testStatus)
        .filter(([key, value]) => {
          return key !== id;
        })
        .reduce((acc:{[key:string]:string}, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
        
      return {
        ...state,
        testStatus: newObject,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };




