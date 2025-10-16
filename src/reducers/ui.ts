import {
  init as _init,
  type ClassState,
  type Dispatch,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import type { FormEvent } from "react";

export const myClass = "chris-ui/ui";

export interface State extends rState {
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
  isTagExpanded: boolean;
  onTagToggle: (e: FormEvent) => void;
  isPackageTagExpanded: boolean;
  onPackageTagToggle: (e: FormEvent) => void;
}

export const defaultState: State = {
  isNavOpen: true,
  sidebarActiveItem: "overview",
  isTagExpanded: false,
  onTagToggle: () => {},
  isPackageTagExpanded: false,
  onPackageTagToggle: () => {},
};

export const init = (myID: string): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(_init({ myID, state: defaultState }));
  };
};

export const setIsNavOpen = (
  myID: string,
  isNavOpen: boolean,
): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(setData(myID, { isNavOpen }));
  };
};

export const setSidebarActive = (
  myID: string,
  activeItem: string,
): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(setData(myID, { sidebarActiveItem: activeItem }));
  };
};

export const setIsTagExpanded = (
  myID: string,
  isTagExpanded: boolean,
): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(setData(myID, { isTagExpanded }));
  };
};

export const setIsPackageTagExpanded = (
  myID: string,
  isPackageTagExpanded: boolean,
): Thunk<State> => {
  return async (dispatch, _) => {
    dispatch(setData(myID, { isPackageTagExpanded }));
  };
};
