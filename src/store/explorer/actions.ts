import { action } from "typesafe-actions";
import { ExplorerActionTypes, ExplorerMode } from "./types";
import { FeedFile } from "@fnndsc/chrisapi";

export const setExplorerRequest = () =>
  action(ExplorerActionTypes.SET_EXPLORER_REQUEST);

export const setSelectedFile = (selectedFile: FeedFile) =>
  action(ExplorerActionTypes.SET_SELECTED_FILE, selectedFile);

export const setSelectedFolder = (selectedFolder: FeedFile[]) =>
  action(ExplorerActionTypes.SET_SELECTED_FOLDER, selectedFolder);

export const setExplorerMode = (mode: ExplorerMode) =>
  action(ExplorerActionTypes.SET_EXPLORER_MODE, mode);

export const destroyExplorer = () =>
  action(ExplorerActionTypes.DESTROY_EXPLORER);

export const setToolStore = (value: boolean) =>
  action(ExplorerActionTypes.ENABLE_DCM_TOOL, value);

export const setFilesForGallery = (items: any[]) =>
  action(ExplorerActionTypes.SET_GALLERY_FILES, items);

export const clearFilesForGallery = () =>
  action(ExplorerActionTypes.CLEAR_GALLERY_FILES);

export const setExternalFiles = (files: any) =>
  action(ExplorerActionTypes.EXTERNAL_FILES, files);

export const clearSelectedFile = () =>
  action(ExplorerActionTypes.CLEAR_SELECTED_FILE);
