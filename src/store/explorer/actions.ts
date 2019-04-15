import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, { IUITreeNode } from "../../api/models/file-explorer";


// Description: Parse the files array into a File tree obj
export const setExplorerRequest = (files: IFeedFile[], selected: IPluginItem) => action(ExplorerActionTypes.SET_EXPLORER_REQUEST, new UITreeNodeModel(files, selected).getTree() );

// Description: Stores the current selected file
export const setSelectedNode = (node: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_NODE, node);

// Description: Stores the current selected folder or parent folder of the selected file
export const setSelectedFolder = (node: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_FOLDER, node);
