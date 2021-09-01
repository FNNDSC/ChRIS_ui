import { action } from "typesafe-actions";
import { ExplorerActionTypes, ExplorerMode } from "./types";

import { DataNode } from "./types";

export const setExplorerRequest = (tree: DataNode[]) =>
  action(ExplorerActionTypes.SET_EXPLORER_REQUEST, tree);

export const setSelectedFile = (selectedFile: DataNode) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, selectedFile);

export const setSelectedFolder = (selectedFolder: DataNode[]) =>
  action(ExplorerActionTypes.SET_SELECTED_FOLDER, selectedFolder);

export const setExplorerMode = (mode: ExplorerMode) =>
  action(ExplorerActionTypes.SET_EXPLORER_MODE, mode);

export const destroyExplorer = () =>
  action(ExplorerActionTypes.DESTROY_EXPLORER);

export const setToolStore = (value: boolean) =>
  action(ExplorerActionTypes.ENABLE_DCM_TOOL, value);

export const setFilesForGallery = (items: any[]) =>
  action(ExplorerActionTypes.SET_GALLERY_FILES, items);
