import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { FeedFile, PluginInstance } from "@fnndsc/chrisapi";

export const setSelectedFile = (
  selectedFile: FeedFile,
  selectedPlugin: PluginInstance
) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, {
    selectedFile,
    selectedPlugin,
  });

export const clearSelectedFile = () =>
  action(ExplorerActionTypes.CLEAR_SELECTED_FILE);
