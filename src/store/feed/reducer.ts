import { Reducer } from 'redux';
import { IFeedState, FeedActionTypes } from './types';


// Type-safe initialState
const initialState: IFeedState = {
   items: undefined
};

 // ***** NOTE: Working *****
const reducer: Reducer<IFeedState> = (state = initialState, action) => {
    switch (action.type) {
        case FeedActionTypes.FETCH_REQUEST: {
            return { ...state  };
        }
        case FeedActionTypes.FETCH_SUCCESS: {
            console.log(action.payload);
            return { ...state, items: action.payload.collection.items  };
        }
        case FeedActionTypes.FETCH_ERROR: {
            return { ...state  };
        }
        case FeedActionTypes.FETCH_COMPLETE: {
            return { ...state  };
        }
        //  ***** Working *****


        default: {
            return state;
        }
    }
};

export { reducer as feedReducer };
