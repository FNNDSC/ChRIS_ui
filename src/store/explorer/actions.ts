import { action } from "typesafe-actions";
import { ExplorerActionTypes } from "./types";
import { IFeedFile } from "../../api/models/feed-file.model";
import { IPluginItem } from "../../api/models/pluginInstance.model";
import UITreeNodeModel, { IUITreeNode } from "../../api/models/file-explorer";
import { IGalleryItem } from "../../api/models/gallery.model";

// Description: Parse the files array into a File tree obj
export const setExplorerRequest = (files: IFeedFile[], selected: IPluginItem) => action(ExplorerActionTypes.SET_EXPLORER_REQUEST, new UITreeNodeModel(files, selected).getTree() );

// Description: Stores the current selected file
export const setSelectedFile = (node: IUITreeNode, galleryItems: IGalleryItem[]) => action(ExplorerActionTypes.SET_SELECTED_FILE, {node, galleryItems});

// Description: Stores the current selected folder or parent folder of the selected file
export const setSelectedFolder = (node: IUITreeNode) => action(ExplorerActionTypes.SET_SELECTED_FOLDER, node);

// Description: Stores the current parent folder of the selected file when displaying gallery style displays for next, prev, play, others functionalities
export const setGalleryItems = (items: IGalleryItem[]) => action(ExplorerActionTypes.SET_GALLERY_ITEMS, items);
export const resetGalleryItems = () => action(ExplorerActionTypes.RESET_GALLERY_ITEMS);
