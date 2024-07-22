import { produce } from "immer";
import type { Reducer } from "redux";
import { UserActionTypes } from "../user/types";
import { UiActionTypes, type IUiState } from "./types";

// Type-safe initialState
const initialState: IUiState = {
  loading: false,
  progress: 0,
  isDropdownOpen: false,
  sidebarActiveItem: "overview",
  isNavOpen: true,
};

const reducer: Reducer<IUiState, { type: string; payload?: any }> = produce(
  (draft: IUiState, action) => {
    switch (action.type) {
      case UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN: {
        draft.isDropdownOpen = action.payload;
        break;
      }

      case UiActionTypes.TOGGLE_NAV: {
        draft.isNavOpen = action.payload;
        break;
      }

      case UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM: {
        draft.sidebarActiveItem = action.payload.activeItem;
        break;
      }

      case UserActionTypes.LOGOUT_USER: {
        draft.isDropdownOpen = false;
        draft.sidebarActiveItem = "overview";
        break;
      }

      default: {
        return draft;
      }
    }
  },
  initialState,
);

export { reducer as uiReducer };
