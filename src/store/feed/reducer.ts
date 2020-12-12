import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
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
    loading: false,
  },
  selectedPlugin: undefined,
  pluginInstances: {
    data: undefined,
    error: "",
    loading: false,
  },
  loadingAddNode: false,
  deleteNodeSuccess: false,
  pluginInstanceResource: {},
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
          data: action.payload.data,
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
          loading:false
        },
      };
    }

    case FeedActionTypes.GET_FEED_ERROR: {
      return {
        ...state,
        currentFeed: {
          ...state.currentFeed,
          error: action.payload,
          loading:false
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_INSTANCES_REQUEST: {
      return {
        ...state,
        pluginInstances: {
          ...state.pluginInstances,
          loading: true,
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      return {
        ...state,
        selectedPlugin: action.payload.selected,
        pluginInstances: {
          data: action.payload.pluginInstances,
          error: "",
          loading: false,
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_INSTANCES_ERROR: {
      return {
        ...state,
        pluginInstances: {
          data: undefined,
          error: action.payload,
          loading: false,
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_INSTANCE_RESOURCE_SUCCESS: {
      const {id, pluginStatus, pluginLog, files,}=action.payload
     
       return {
         ...state,
         pluginInstanceResource:{
           ...state.pluginInstanceResource,
           [id]:{
             ...state.pluginInstanceResource[id],
             pluginLog,
             pluginStatus,
             files
           }
         }
       }       
  }

  case FeedActionTypes.GET_PLUGIN_FILES_SUCCESS:{
     const {id,pluginLog,pluginStatus,files}=action.payload
      return {
         ...state,
         pluginInstanceResource:{
           ...state.pluginInstanceResource,
           [id]:{
             ...state.pluginInstanceResource[id],
             pluginLog,
             pluginStatus,
             files
           }
         }
       }
     }
  
  

    case FeedActionTypes.RESET_FEED_STATE: {
      return {
        ...state,
        pluginInstances: {
          data: undefined,
          error: "",
          loading: false,
        },
        selectedPlugin: undefined,
        deleteNodeSuccess: false,
        testStatus: {},
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
    case FeedActionTypes.GET_SELECTED_PLUGIN: {
      return {
        ...state,
        selectedPlugin: action.payload,
      };
    }

    case FeedActionTypes.ADD_NODE_REQUEST: {
      return {
        ...state,
        loadingAddNode: true,
      };
    }

    case FeedActionTypes.ADD_NODE_SUCCESS: {
      if (state.pluginInstances.data) {
        const sortedPluginList = [
          ...state.pluginInstances.data,
          action.payload,
        ].sort((a: PluginInstance, b: PluginInstance) => {
          return b.data.id - a.data.id;
        });
        return {
          ...state,
          pluginInstances: {
            data: sortedPluginList,
            error: "",
            loading: false,
          },
          loadingAddNode: false,
        };
      } else
        return {
          ...state,
          pluginInstances: {
            data: [action.payload],
            error: "",
            loading: false,
          },
          loadingAddNode: false,
        };
    }

    case FeedActionTypes.DELETE_NODE_SUCCESS: {
      return {
        ...state,
        deleteNodeSuccess: !state.deleteNodeSuccess,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };




