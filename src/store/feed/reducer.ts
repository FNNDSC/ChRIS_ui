import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";
import { PluginInstance } from "@fnndsc/chrisapi";

// Type-safe initialState
export const initialState: IFeedState = {
  feed: undefined,
  feeds: undefined,
  feedsCount: 0,
  pluginInstances: [],
  selected: undefined,
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
    case FeedActionTypes.GET_FEED_SUCCESS: {
      return { ...state, feed: action.payload };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      return { ...state, pluginInstances: action.payload };
    }
    case FeedActionTypes.RESET_FEED_STATE: {
      return {
        ...state,
        pluginInstances: [],
        feed: undefined,
        selected: undefined,
      };
    }
    case FeedActionTypes.ADD_FEED: {
      if (state.feeds && state.feedsCount) {
        return {
          ...state,
          feeds: [action.payload, ...state.feeds],
          feedsCount: state.feedsCount + 1,
        };
      } else {
        return {
          ...state,
          feeds: [action.payload],
          feedsCount: state.feedsCount
            ? state.feedsCount + 1
            : state.feedsCount,
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

    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
