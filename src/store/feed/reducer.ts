import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

// Type-safe initialState
const initialState: IFeedState = {
  details: undefined,
  items: undefined,
  feeds: undefined
  // selected: undefined,
  // descendants: undefined
};

// ***** NOTE: Working *****
const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_ALL_FEEDS_SUCCESS: {
     // return { ...state, feeds: action.payload.collection.items }; // Using the chrisApi
      return { ...state, feeds: action.payload.data.results }; // Using the chrisApi
    }
    case FeedActionTypes.GET_FEED_DETAILS_SUCCESS: {
      // return { ...state, details: action.payload.collection.items }; // Using the api
      return { ...state, details: action.payload };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      // Note: when using the ChrisAPI the items will be action.payload.collection.items
      // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.FETCH_REQUEST: {
      return { ...state };
    }
    case FeedActionTypes.FETCH_SUCCESS: {
      // Note: when using the ChrisAPI the items will be action.payload.collection.items
      // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
      return { ...state, items: action.payload.data.results };
    }
    case FeedActionTypes.FETCH_ERROR: {
      return { ...state };
    }
    case FeedActionTypes.FETCH_COMPLETE: {
      return { ...state };
    }
    case FeedActionTypes.RESET_STATE: {
      return { ...state, items: undefined, details: undefined };
    }
    //  ***** Working *****
    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
