import { DrawerPayloadType, IDrawerState } from "../../store/drawer/types";
import { setDrawerState } from "../../store/drawer/actions";
import type { Dispatch } from "redux";

export const handleDrawerActions = (
  actionType: string,
  open: boolean,
  maximized: boolean,
  minimized: boolean,
  dispatch: Dispatch,
  action: (action: DrawerPayloadType) => {
    type: any;
    payload: {
      actionType: string;
      open: boolean;
      maximized: boolean;
      minimized: boolean;
    };
  }
) => {
  dispatch(
    action({
      actionType,
      open,
      maximized,
      minimized,
    })
  );
};

export const handleClose = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(
    actionType,
    false,
    false,
    false,
    dispatch,
    setDrawerState
  );
};

export const handleMaximize = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, true, false, dispatch, setDrawerState);
};

export const handleMinimize = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, false, true, dispatch, setDrawerState);
};

export const handleOpen = (actionType: string, dispatch: Dispatch) => {
  handleDrawerActions(actionType, true, false, false, dispatch, setDrawerState);
};

export const handleToggle = (
  actionType: string,
  drawerState: IDrawerState,
  dispatch: Dispatch
) => {
  handleDrawerActions(
    actionType,
    !drawerState[actionType].open,
    drawerState[actionType].maximized,
    false,
    dispatch,
    setDrawerState
  );
};
