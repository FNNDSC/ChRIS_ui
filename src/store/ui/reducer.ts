import { Reducer } from "redux";
import { UiActionTypes, IUiState } from "./types";
import { UserActionTypes } from "../user/types";

// Type-safe initialState
const initialState: IUiState = {
  loading: false,
  progress: 0,
  isDropdownOpen: false,
  sidebarActiveItem: "dashboard",
  isNavOpen: true,
};

const reducer: Reducer<IUiState> = (state = initialState, action) => {
  switch (action.type) {
    case UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN: {
      return { ...state, isDropdownOpen: action.payload };
    }

    case UiActionTypes.TOGGLE_NAV: {
      return { ...state, isNavOpen: action.payload };
    }
    case UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM: {
      return {
        ...state,
        sidebarActiveItem: action.payload.activeItem,
        sidebarActiveGroup: action.payload.activeGroup,
      };
    }

    case UserActionTypes.LOGOUT_USER: {
      return {
        ...state,
        isDropdownOpen: false,
        sidebarActiveItem: "dashboard",
      };
    }

    // TOGGLE_SIDEBAR
    default: {
      return state;
    }
  }
};

export { reducer as uiReducer };
