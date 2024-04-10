import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";

//Type to be determined
export const setSelectedFile = (selectedFile: any) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, selectedFile);

export const clearSelectedFile = () =>
  action(ExplorerActionTypes.CLEAR_SELECTED_FILE);
