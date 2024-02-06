import { action } from "typesafe-actions";
import { DrawerActionTypes } from "./types";

export const setDrawerState = (drawerState: {
  actionType: string;
  open: boolean;
  maximized: boolean;
  minimized: boolean;
}) => {
  return action(DrawerActionTypes.SET_DRAWER_STATE, drawerState);
};

export const setFilePreviewPanel = () => {
  return action(DrawerActionTypes.SET_PREVIEW_PANEL);
};

export const setDrawerCurrentlyActive = (
  panel: string,
  currentlyActive: string,
) => {
  return action(DrawerActionTypes.SET_CURRENTLY_ACTIVE, {
    panel,
    currentlyActive,
  });
};
