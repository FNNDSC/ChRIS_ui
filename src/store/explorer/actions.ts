import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, { IUITreeNode } from "../../api/models/file-explorer";


// Description: Parse the files array into a File tree obj
export const setExplorerRequest = (files: IFeedFile[], selected: IPluginItem) => action(ExplorerActionTypes.SET_EXPLORER_REQUEST, new UITreeNodeModel(files, selected).getTree() );
// export const setExplorerSuccess = (items: IFeedFile[], selected: IPluginItem) => action( ExplorerActionTypes.SET_EXPLORER_SUCCESS, new UITreeNodeModel(items, selected).getTree());

export const setSelectedNode = (node: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_NODE, node);
