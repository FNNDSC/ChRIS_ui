import { Reducer } from "redux";
import { UiActionTypes, IUiState } from "./types";


// Type-safe initialState
const initialState: IUiState = {
    loading: false,
    progress: 0,
    isDropdownOpen: false,
    isKebabDropdownOpen: false,
    isSidebarOpen: true,
    sidebarActiveItem: "dashboard",
    sidebarActiveGroup: "feeds_grp"
};

const reducer: Reducer<IUiState> = (state = initialState, action) => { //  ***** Working ***** //
    switch (action.type) {
        case UiActionTypes.FETCH_REQUEST: {
            return { ...state, loading: true };
        }
        case UiActionTypes.FETCH_COMPLETE: {
            return { ...state, loading: false };
        }
        case UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN: {
            return { ...state, isDropdownOpen: action.payload };
        }
        case UiActionTypes.TOGGLE_TOOLBAR_KEBAB: {
            return { ...state,  isKebabDropdownOpen: action.payload };
        }
        case UiActionTypes.TOGGLE_SIDEBAR: {
            return { ...state,  isSidebarOpen: action.payload };
        }
        case UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM: {
            return {...state, sidebarActiveItem: action.payload.activeItem, sidebarActiveGroup: action.payload.activeGroup };
        }

       // TOGGLE_SIDEBAR
        default: {
            return state;
        }
    }
};

export { reducer as uiReducer };
