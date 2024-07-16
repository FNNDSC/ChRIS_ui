import keyMirror from "keymirror";
import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";

export interface SelectionPayload {
  path: string;
  type: string;
  payload: FileBrowserFolderFile | FileBrowserFolder;
}

export interface ICartState {
  selectedPaths: SelectionPayload[];
  openCart: boolean;
}

export const ICartActionTypes = keyMirror({
  SET_SELECTED_PATHS: null,
  CLEAR_SELECTED_PATHS: null,
  CLEAR_CART: null,
  SET_TOGGLE_CART: null,
});
