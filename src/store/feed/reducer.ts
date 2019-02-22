import { Reducer } from "redux";
import { IFeedState, FeedActionTypes } from "./types";

// Type-safe initialState
const initialState: IFeedState = {
  details: undefined,
  items: undefined,
  selected: undefined
};

// ***** NOTE: Working *****
const reducer: Reducer<IFeedState> = (state = initialState, action) => {
  switch (action.type) {
    case FeedActionTypes.GET_FEED_DETAILS_SUCCESS: {
      // return { ...state, details: action.payload.collection.items }; // Using the api
      return { ...state, details: action.payload.data };
    }
    case FeedActionTypes.GET_PLUGIN_INSTANCES_SUCCESS: {
      // Note: when using the ChrisAPI the items will be action.payload.collection.items
      // return { ...state, items: action.payload.collection.items }; //Note: For API call... stub
      return { ...state, items: action.payload.data.results };
    }
    // setSelectedPluginNode
    case FeedActionTypes.SET_SELECTED_PLUGIN: {
      console.log("SET_SELECTED_PLUGIN: ", action.payload );
      return { ...state, selected: action.payload };
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
    //  ***** Working *****
    default: {
      return state;
    }
  }
};

export { reducer as feedReducer };
