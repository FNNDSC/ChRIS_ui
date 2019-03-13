/*
*  File:            ui/types.ts
*  Description:     Holds types and constants for managing global UI states
*  Author:          ChRIS UI
*/


import keyMirror from "keymirror";

// Description: state for UI Manager
export interface IUiState {
  loading?: boolean;
  progress?: number;
  isDropdownOpen?: boolean;
  isKebabDropdownOpen?: boolean;
  isSidebarOpen?: boolean;
  sidebarActiveItem?: string;
  sidebarActiveGroup?: string;
}


export const UiActionTypes = keyMirror({
    FETCH_REQUEST: null, // before request
    FETCH_SUCCESS: null, // request is successful
    FETCH_ERROR: null, // request failed
    FETCH_COMPLETE: null, // after request completes
    PROGRESS_REQUEST: null, // not in user yet - TBD
    PROGRESS_COMPLETE: null, // not in user yet - TBD
    TOGGLE_TOOLBAR_KEBAB: null,
    TOGGLE_TOOLBAR_DROPDOWN: null,
    TOGGLE_SIDEBAR: null,
    SET_SIDEBAR_ACTIVE_ITEM: null
  });
