import keyMirror from "keymirror";

export interface IDrawerState {
  [key: string]: {
    open: boolean;
    maximized: boolean;
  };
}

export interface DrawerPayloadType {
  actionType: string;
  open: boolean;
  maximized: boolean;
  minimized: boolean;
}

export const DrawerActionTypes = keyMirror({
  SET_DRAWER_STATE: null,
  SET_PREVIEW_PANEL: null,
});
