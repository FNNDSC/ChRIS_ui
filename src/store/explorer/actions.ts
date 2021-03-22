import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";

import { DataNode } from "./types";

export const setExplorerRequest = (tree: DataNode[]) =>
  action(ExplorerActionTypes.SET_EXPLORER_REQUEST, tree);

export const setSelectedFile = (selectedFile: DataNode) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, selectedFile);

export const toggleViewerMode = (isViewerOpened: boolean) =>
  action(ExplorerActionTypes.TOGGLE_VIEWER_MODE, isViewerOpened);

export const destroyExplorer = () =>
  action(ExplorerActionTypes.DESTROY_EXPLORER);
