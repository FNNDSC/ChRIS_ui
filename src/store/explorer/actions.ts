import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { FeedFile } from "@fnndsc/chrisapi";

export const setSelectedFile = (selectedFile: FeedFile) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, selectedFile);

export const clearSelectedFile = () =>
  action(ExplorerActionTypes.CLEAR_SELECTED_FILE);
