import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, { IUITreeNode } from "../../api/models/file-explorer.model";

// Description: Parse the files array into a File tree obj
export const setExplorerRequest = (files: IFeedFile[], selected: IPluginItem) => action(ExplorerActionTypes.SET_EXPLORER_REQUEST, new UITreeNodeModel(files, selected).getTree() );

// Description: Stores the current selected file
export const setSelectedFile = (selectedFile: IUITreeNode, selectedFolder?: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_FILE, {selectedFile, selectedFolder});

// Description: Stores the current selected folder or parent folder of the selected file
export const setSelectedFolder = (selectedFolder: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_FOLDER, selectedFolder);

export const toggleViewerMode = (isViewerOpened: boolean) => action(ExplorerActionTypes.TOGGLE_VIEWER_MODE, isViewerOpened);

export const destroyExplorer = () => action(ExplorerActionTypes.DESTROY_EXPLORER);
