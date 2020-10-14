import { Reducer } from "redux";
import { UiActionTypes, IUiState } from "./types";


// Type-safe initialState
const initialState: IUiState = {
    loading: false,
    progress: 0,
    isDropdownOpen: false,
    sidebarActiveItem: "dashboard",
    isNavOpen: true,
    isMobileView:true,
    isNavOpenMobile:false
};

const reducer: Reducer<IUiState> = (state = initialState, action) => { //  ***** Working ***** //
    switch (action.type) {
       
        case UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN: {
            return { ...state, isDropdownOpen: action.payload };
        }
       
        case UiActionTypes.TOGGLE_NAV: {
            return { ...state,  isNavOpen: action.payload };
        }
        case UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM: {
            return {...state, sidebarActiveItem: action.payload.activeItem, sidebarActiveGroup: action.payload.activeGroup };
        }

        case UiActionTypes.TOGGLE_MOBILE_VIEW:{
            return {...state, isMobileView:action.payload}
        }

        case UiActionTypes.TOGGLE_MOBILE_NAV:{
            return {...state, isNavOpenMobile:action.payload}
        }

       // TOGGLE_SIDEBAR
        default: {
            return state;
        }
    }
};

export { reducer as uiReducer };
