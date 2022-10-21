import { action } from "typesafe-actions";
import {
    messageActionTypes,
    IMessage,
    IConfirmation
} from "./types";

//  Description: Handle messaging and confirmation actions:
export const handleMessage = (message: IMessage) => action(messageActionTypes.DISPLAY_CONFIRMATION, message);
export const dismissMessage = () => action(messageActionTypes.DISMISS_MESSAGE);

// confirmation
export const handleConfirmation = (confirmation: IConfirmation) => action(messageActionTypes.DISPLAY_CONFIRMATION, confirmation);
export const dismissConfirmation = () => action(messageActionTypes.DISMISS_CONFIRMATION);

