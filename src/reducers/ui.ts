import {
  init as _init,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";

export const myClass = "chris-ui/ui";

export interface State extends rState {
  isNavOpen?: boolean;
  sidebarActiveItem?: string;
  isTagExpanded: boolean;
  isPackageTagExpanded: boolean;
}

export const defaultState: State = {
  isNavOpen: true,
  sidebarActiveItem: "overview",
  isTagExpanded: false,
  isPackageTagExpanded: false,
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
