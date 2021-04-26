import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
import { PluginInstance } from "@fnndsc/chrisapi";
import { getStatusLabels } from "./utils";

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
  pluginInstanceStatus: {},
  pluginInstances: {
    data: undefined,
    error: "",
    loading: false,
  },
  loadingAddNode: false,

  pluginInstanceResource: {},
  pluginFiles: {},
  feedTreeProp: {
    orientation: "vertical",
    translate: {
      x: 600,
      y: 50,
    },
  },
  currentLayout: true,
  deleteNodeSuccess: false,
  treeMode: true,
  tsNodes: undefined,
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
      const { id, pluginStatus, pluginLog, pluginDetails } = action.payload;
      const pluginStatusLabels = getStatusLabels(pluginStatus, pluginDetails);

      return {
        ...state,
        pluginInstanceResource: {
          ...state.pluginInstanceResource,
          [id]: {
            pluginStatus: pluginStatusLabels,
            pluginLog,
          },
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_FILES_SUCCESS: {
      const { id, files } = action.payload;

      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files,
            error: "",
          },
        },
      };
    }

    case FeedActionTypes.GET_PLUGIN_FILES_ERROR: {
      const { id, error } = action.payload;
      return {
        ...state,
        pluginFiles: {
          ...state.pluginFiles,
          [id]: {
            files: [],
            error,
          },
        },
      };
    }

    case FeedActionTypes.ADD_FEED: {
      if (state.allFeeds.data && state.allFeeds.totalFeedsCount) {
        return {
          ...state,
          allFeeds: {
            data: [action.payload.data, ...state.allFeeds.data],
            error: "",
            loading: false,
            totalFeedsCount: state.allFeeds.totalFeedsCount + 1,
          },
        };
      } else {
        return {
          ...state,
          allFeeds: {
            data: [action.payload.data],
            error: "",
            loading: false,
            totalFeedsCount: state.allFeeds.totalFeedsCount + 1,
          },
        };
      }
    }
    case FeedActionTypes.GET_SELECTED_PLUGIN: {
      const pluginInstance = state.pluginInstances.data?.find((instance) => {
        return instance.data.id === action.payload.data.id;
      });

      return {
        ...state,
        selectedPlugin: pluginInstance,
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
        const pluginList = [...state.pluginInstances.data, action.payload];
        return {
          ...state,
          pluginInstances: {
            data: pluginList,
            error: "",
            loading: false,
          },
          loadingAddNode: false,
        };
      } else
        return {
          ...state,
          pluginInstances: {
            data: action.payload,
            error: "",
            loading: false,
          },
          loadingAddNode: false,
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

    case FeedActionTypes.DELETE_NODE_SUCCESS: {
      const id = action.payload;
      const pluginInstances = state.pluginInstances.data
        ?.map((instance) => {
          if (instance.data.id === id || instance.data.previous_id === id) {
            return undefined;
          } else return instance;
        })
        .filter((instance) => instance);

      const selectedPlugin =
        pluginInstances && pluginInstances[pluginInstances.length - 1];
      const pluginInstanceStatus = state.pluginInstanceStatus;
      const pluginInstanceResource = state.pluginInstanceResource;
      const pluginFiles = state.pluginFiles;
      delete pluginInstanceStatus[id];
      delete pluginInstanceResource[id];
      delete pluginFiles[id];

      return {
        ...state,
        pluginInstances: {
          data: pluginInstances,
          error: "",
          loading: false,
        },
        selectedPlugin,
        pluginInstanceResource,
        pluginInstanceStatus,
        pluginFiles,
        deleteNodeSuccess: true,
      };
    }

    case FeedActionTypes.GET_PLUGIN_STATUS_SUCCESS: {
      const { selected, status } = action.payload;

      return {
        ...state,
        pluginInstanceStatus: {
          ...state.pluginInstanceStatus,
          [selected.data.id]: {
            status,
          },
        },
      };
    }

    case FeedActionTypes.SET_LAYOUT: {
      return {
        ...state,
        currentLayout: !state.currentLayout,
      };
    }

    case FeedActionTypes.RESET_PLUGIN_STATE: {
      return {
        ...state,
        currentFeed: {
          data: undefined,
          error: "",
          loading: false,
        },
        pluginInstances: {
          data: undefined,
          error: "",
          loading: false,
        },
        pluginInstanceResource: {},
        pluginInstanceStatus: {},
        pluginFiles: {},
        selectedPlugin: undefined,
        feedProp: {
          orientation: "vertical",
          translate: {
            x: 600,
            y: 50,
          },
        },
        currentLayout: true,
        treeMode: true,
      };
    }

    case FeedActionTypes.SWITCH_TREE_MODE: {
      return {
        ...state,
        treeMode: !action.payload,
      };
    }

    case FeedActionTypes.ADD_TS_NODE: {
      if (!state.tsNodes) {
        return {
          ...state,
          tsNodes: [action.payload],
        };
      } else {
        const node = state.tsNodes.find(
          (node) => node.data.id === action.payload.data.id
        );

        if (node) {
          return {
            ...state,
          };
        } else
          return {
            ...state,
            tsNodes: [...state.tsNodes, action.payload],
          };
      }
    }

    case FeedActionTypes.DELETE_TS_NODE: {
      if (state.tsNodes) {
        const filteredNodes = state.tsNodes.filter(
          (node) => node.data.id !== action.payload.data.id
        );
        return {
          ...state,
          tsNodes: filteredNodes,
        };
      } else return { ...state };
    }

    case FeedActionTypes.ADD_SPLIT_NODES_SUCCESS: {
      const pluginInstances = state.pluginInstances.data;
      if (pluginInstances) {
        const newList: PluginInstance[] = [
          ...pluginInstances,
          ...action.payload,
        ];
        return {
          ...state,
          pluginInstances: {
            data: newList,
            error: "",
            loading: false,
          },
        };
      } else return state;
    }

    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
