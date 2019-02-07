/*
*  File:            ui/types.ts
*  Description:     Holds types and constants for managing global UI states
*  Author:          ChRIS ui Demo                 
*/


import keyMirror from "keymirror";

// Description: state for UI Manager
export interface IUiState {
  loading: boolean;
  progress: number; 
  isDropdownOpen: boolean;
  isKebabDropdownOpen:boolean;
  leftNavActiveItem: string;
  leftNavActiveGroup: string;
}


export const UiActionTypes = keyMirror({
    FETCH_REQUEST: null, //before request
    FETCH_SUCCESS:null, // request is successful 
    FETCH_ERROR:null, // request failed
    FETCH_COMPLETE: null, //after request completes 
    PROGRESS_REQUEST: null, // not in user yet - TBD
    PROGRESS_COMPLETE: null, // not in user yet - TBD
  });