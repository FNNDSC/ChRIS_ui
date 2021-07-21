import { action } from "typesafe-actions";
import {
    UiActionTypes
} from "./types";



// Toggle menus, sidebar and nav items
export const onDropdownSelect = (isOpened: boolean) => action(UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN, isOpened);
export const onSidebarToggle = (isOpened: boolean) => action(UiActionTypes.TOGGLE_SIDEBAR, isOpened);

// Set active sidebar item and group
export const setIsNavOpen= (isOpened:boolean) => action(UiActionTypes.TOGGLE_NAV,isOpened);
export const setSidebarActive = (active: {
  activeItem: string;
  activeGroup: string;
}) => action(UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM, active);