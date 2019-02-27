import { Reducer } from "redux";
import { messageActionTypes, IMessageState } from "./types";


// Type-safe initialState
const initialState: IMessageState = {
    message: undefined,
  confirmation: undefined
};

const reducer: Reducer<IMessageState> = (state = initialState, action) => {
    switch (action.type) {
        case messageActionTypes.DISPLAY_MESSAGE: {
            return { ...state  };
        }
        case messageActionTypes.DISMISS_MESSAGE: {
            return { ...state  };
        }
        case messageActionTypes.DISPLAY_CONFIRMATION: {
            return { ...state  };
        }
        case messageActionTypes.DISMISS_CONFIRMATION: {
            return { ...state  };
        }
        //  ***** Working *****


        default: {
            return state;
        }
    }
};

export { reducer as messageReducer };
