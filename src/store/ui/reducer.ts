import { Reducer } from "redux";
import { UiActionTypes, IUiState } from "./types";


// Type-safe initialState 
const initialState: IUiState = {
    loading: false,
    progress: 0,
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    leftNavActiveItem: '',
    leftNavActiveGroup: ''
};

const reducer: Reducer<IUiState> = (state = initialState, action) => {
    switch (action.type) {
        case UiActionTypes.FETCH_REQUEST: {
            return { ...state, loading: true };
        }
        case UiActionTypes.FETCH_COMPLETE: {
            return { ...state, loading: false };
        }
        //  ***** Working *****


        default: {
            return state;
        }
    }
};

export { reducer as uiReducer };
