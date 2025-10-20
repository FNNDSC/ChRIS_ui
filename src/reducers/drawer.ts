import {
  init as _init,
  genUUID,
  getState,
  type State as rState,
  setData,
  type Thunk,
} from "@chhsiao1981/use-thunk";
import { Role } from "./types";

export const myClass = "chris-ui/drawer";

type DrawerState = {
  open: boolean;
  maximized: boolean;
  minimized: boolean;
  currentlyActive: string;
};

export interface State extends rState {
  graph: DrawerState;
  node: DrawerState;
  files: DrawerState;
  preview: DrawerState;
}

export type ActionType = keyof State;

export const defaultState: State = {
  graph: {
    open: true,
    maximized: false,
    minimized: false,
    currentlyActive: "graph",
  },
  node: {
    open: true,
    maximized: false,
    minimized: false,
    currentlyActive: "node",
  },
  files: {
    open: true,
    maximized: false,
    minimized: false,
    currentlyActive: "files",
  },
  preview: {
    open: false,
    maximized: false,
    minimized: false,
    currentlyActive: "preview",
  },
};

const defaultStateClinician: State = {
  graph: {
    open: false,
    maximized: false,
    minimized: false,
    currentlyActive: "graph",
  },
  node: {
    open: false,
    maximized: false,
    minimized: false,
    currentlyActive: "node",
  },
  files: {
    open: true,
    maximized: false,
    minimized: false,
    currentlyActive: "files",
  },
  preview: {
    open: false,
    maximized: false,
    minimized: false,
    currentlyActive: "preview",
  },
};

export const init = (): Thunk<State> => {
  const myID = genUUID();
  return (dispatch, _) => {
    dispatch(_init({ myID, state: defaultState }));
  };
};

export const toggle = (myID: string, actionType: ActionType): Thunk<State> => {
  return (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    // @ts-expect-error XXX DrawerState
    const drawerState: DrawerState = me[actionType];
    dispatch(
      setDrawerState(
        myID,
        actionType,
        !drawerState.open,
        drawerState.maximized,
        false,
      ),
    );
  };
};

export const setDrawerState = (
  myID: string,
  actionType: ActionType,
  open: boolean,
  maximized: boolean,
  minimized: boolean,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    if (maximized) {
      dispatch(maximize(myID, actionType));
      return;
    }

    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    // @ts-expect-error drawerState is always DrawerState
    const drawerState: DrawerState = me[actionType];
    const { currentlyActive } = drawerState;

    const toUpdate = {
      open,
      maximized,
      minimized,
      currentlyActive: currentlyActive,
    };
    dispatch(setData(myID, { [actionType]: toUpdate }));
  };
};

export const setDrawerCurrentlyActive = (
  myID: string,
  actionType: ActionType,
  currentlyActive: string,
): Thunk<State> => {
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    // @ts-expect-error drawerState
    const drawerState: DrawerState = me[actionType];
    const newDrawerState = Object.assign({}, drawerState, { currentlyActive });

    dispatch(setData(myID, { [actionType]: newDrawerState }));
  };
};

export const maximize = (
  myID: string,
  actionType: ActionType,
): Thunk<State> => {
  // XXX different from the original drawerSlicer: setup open/maxmized for the matched actionType the same as original setup.

  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const newMe = Object.keys(me).reduce((r: State, each: ActionType) => {
      const eachDrawerState = me[each];
      const toUpdate =
        each === actionType
          ? { open: true, maximized: true }
          : { open: false, maximized: false };

      r[each] = Object.assign({}, eachDrawerState, toUpdate);

      return r;
    }, {} as State);

    dispatch(setData(myID, newMe));
  };
};

export const minimize = (myID: string): Thunk<State> => {
  // XXX different from the original drawerSlicer: setup open/maxmized for the matched actionType the same as original setup.
  return async (dispatch, getClassState) => {
    const classState = getClassState();
    const me = getState(classState, myID);
    if (!me) {
      return;
    }

    const newMe = Object.keys(me).reduce((r: State, each: ActionType) => {
      const eachDrawerState = me[each];
      const toUpdate = { open: true, maximized: false };

      r[each] = Object.assign({}, eachDrawerState, toUpdate);

      return r;
    }, {} as State);

    dispatch(setData(myID, newMe));
  };
};

export const setFilePreviewPanel = (myID: string): Thunk<State> => {
  return (dispatch, _) => {
    const toUpdate = {
      preview: {
        open: true,
        maximize: false,
        minimized: false,
        currentlyActive: "preview",
      },
    };
    dispatch(setData(myID, toUpdate));
  };
};

export const resetDrawerState = (
  myID: string,
  role: Role,
  isSuccess: boolean,
): Thunk<State> => {
  return (dispatch, _) => {
    const isClinician = role === Role.Clinician && isSuccess;
    const resetState = isClinician ? defaultStateClinician : defaultState;

    const toUpdate = Object.keys(resetState).reduce(
      (r: State, each: string) => {
        r[each] = Object.assign({}, resetState[each]);
        return r;
      },
      {} as State,
    );

    dispatch(setData(myID, toUpdate));
  };
};
