/*
*  File:            message/types.ts
*  Description:     Holds types and constants for managing global messaging and confirmation dialogs
*  Author:          ChRIS UI
*  Notes:           Work in progres ...
*/

import keyMirror from "keymirror";


export interface IMessageState {
  message?: IMessage; // Contains messaging infomrmation
  confirmation?: IConfirmation;
}

export interface IMessage {
  message: string | string[];
  type: MessageType;
  displayType: MessageDisplayType;
}

export const IMessageType = keyMirror({
  success: null,
  error: null,
  info: null,
  warning: null
});

export type MessageType = "success" | "error" | "info" | "warning";


// Description: Handle message handler types
export const MessageHandlerType = keyMirror({
  modal: null,
  toastr: null, // User toatr to show error
  inline: null, // write message inline
  logger: null, // write message in console.log
  muted: null, // pass message but not to user - stub for logging later
});
export type MessageDisplayType = "modal" | "toastr" | "inline" | "muted" | "logger";

export const messageDefaults = {
  defaultMessage: {
      Error: "An unknown error occured.",
      success: "Your request was processed successfully",
  }
};

// Confirmation / Modal handling
export interface IConfirmation {
  title?: string;
  text: string;
  confirm?: IModalActions;
  dismiss?: IModalActions;
}
export interface IModalActions {
  label: string;
  action?: string; // Pass the name of the action
  data?: any; // Pass the data for the respective action
}

export const messageActionTypes = keyMirror({
  DISPLAY_MESSAGE: null,
  DISMISS_MESSAGE: null,
  DISPLAY_CONFIRMATION: null,
  DISMISS_CONFIRMATION: null,
});
