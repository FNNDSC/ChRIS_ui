import { action } from "typesafe-actions";
import {
    UiActionTypes
} from "./types";

//  Description: Actions for UI Manager: example:
export const uiOnBeforeRequest = () => action(UiActionTypes.FETCH_REQUEST);
export const uiOnCompleteRequest = () => action(UiActionTypes.FETCH_COMPLETE);

// Toggle menus, sidebar and nav items
export const onDropdownSelect = (isOpened: boolean) => action(UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN, isOpened);
export const onKebabDropdownSelect = (isOpened: boolean) => action(UiActionTypes.TOGGLE_TOOLBAR_KEBAB, isOpened);
export const onSidebarToggle = (isOpened: boolean) => action(UiActionTypes.TOGGLE_SIDEBAR, isOpened);

// Set active sidebar item and group
export const setSidebarActive = (active: {activeItem: string, activeGroup: string}) => action(UiActionTypes.SET_SIDEBAR_ACTIVE_ITEM, active);
