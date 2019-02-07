import { action } from 'typesafe-actions';
import {
    UiActionTypes
} from './types';

//  Description: Actions for UI Manager: example: 
export const uiOnBeforeRequest = () => action(UiActionTypes.FETCH_REQUEST);
export const uiOnCompleteRequest = () => action(UiActionTypes.FETCH_COMPLETE);

export const onDropdownSelect = (isOpened: boolean) => action(UiActionTypes.TOGGLE_TOOLBAR_DROPDOWN, isOpened);
export const onKebabDropdownSelect = (isOpened: boolean) => action(UiActionTypes.TOGGLE_TOOLBAR_KEBAB, isOpened);
