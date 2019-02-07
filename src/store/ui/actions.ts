import { action } from 'typesafe-actions';
import {
    UiActionTypes
} from './types';

//  Description: Actions for UI Manager: example: 
export const uiOnBeforeRequest = () => action(UiActionTypes.FETCH_REQUEST);
export const uiOnCompleteRequest = () => action(UiActionTypes.FETCH_COMPLETE);
