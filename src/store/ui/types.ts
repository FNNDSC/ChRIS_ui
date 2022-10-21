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
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
}


export const UiActionTypes = keyMirror({
    TOGGLE_MOBILE_VIEW:null,
    TOGGLE_NAV:null,
    TOGGLE_MOBILE_NAV:null,
    TOGGLE_TOOLBAR_DROPDOWN: null,
    TOGGLE_SIDEBAR: null,
    SET_SIDEBAR_ACTIVE_ITEM: null
  });
