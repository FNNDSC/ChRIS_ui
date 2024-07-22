import { produce } from "immer";
import type { Reducer } from "redux";
import { type IFeedState, FeedActionTypes } from "./types";

export const initialState: IFeedState = {
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

const reducer: Reducer<IFeedState> = produce(
  (draft: IFeedState, action: typeof FeedActionTypes) => {
    switch (action.type) {
      case FeedActionTypes.GET_FEED_SUCCESS: {
        draft.currentFeed.data = action.payload;
        draft.currentFeed.error = "";
        draft.currentFeed.loading = false;
        break;
      }

      case FeedActionTypes.SET_LAYOUT: {
        draft.currentLayout = !draft.currentLayout;
        break;
      }

      case FeedActionTypes.TRANSLATE_PROP: {
        draft.feedTreeProp.translate = action.payload;
        break;
      }

      case FeedActionTypes.GET_FEED_TREE_PROP: {
        const currentOrientation = action.payload;
        draft.feedTreeProp.orientation =
          currentOrientation === "horizontal" ? "vertical" : "horizontal";
        break;
      }

      case FeedActionTypes.SET_ALL_SELECT: {
        draft.bulkSelect = [...action.payload];
        break;
      }

      case FeedActionTypes.BULK_SELECT: {
        draft.bulkSelect = action.payload.feeds;
        draft.selectAllToggle = action.payload.selectAllToggle;
        break;
      }

      case FeedActionTypes.REMOVE_BULK_SELECT: {
        draft.bulkSelect = action.payload.feeds;
        draft.selectAllToggle = action.payload.selectAllToggle;
        break;
      }

      case FeedActionTypes.SET_SEARCH_FILTER: {
        draft.searchFilter.value = action.payload;
        draft.searchFilter.status = !draft.searchFilter.status;
        break;
      }

      case FeedActionTypes.TOGGLE_SELECT_ALL: {
        draft.selectAllToggle = action.payload;
        break;
      }

      case FeedActionTypes.REMOVE_ALL_SELECT: {
        draft.bulkSelect = [];
        break;
      }

      case FeedActionTypes.SHOW_TOOLBAR: {
        draft.showToolbar = action.payload;
        break;
      }

      case FeedActionTypes.RESET_FEED: {
        return initialState;
      }

      default:
        return draft;
    }
  },
  initialState,
);

export { reducer as feedsReducer };
