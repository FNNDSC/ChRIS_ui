import { Reducer } from "redux";
import { DrawerActionTypes, IDrawerState, DrawerPayloadType } from "./types";

const initialState: IDrawerState = {
  graph: {
    open: true,
    maximized: false,
    currentlyActive: "graph",
  },
  node: {
    open: true,
    maximized: false,
    currentlyActive: "node",
  },
  directory: {
    open: true,
    maximized: false,
    currentlyActive: "directory",
  },
  files: {
    open: true,
    maximized: false,
    currentlyActive: "files",
  },
  preview: {
    open: false,
    maximized: false,
    currentlyActive: "filePreview",
  },
};

const reducer: Reducer<IDrawerState> = (state = initialState, action) => {
  switch (action.type) {
    case DrawerActionTypes.SET_DRAWER_STATE: {
      let newState;
      if (action.payload.maximized === true) {
        newState = getMaximizedObject(state, action.payload);
      } else if (action.payload.minimized === true) {
        newState = getMinimizedObject(state, action.payload);
      } else {
        newState = {
          ...state,
          [action.payload.actionType]: {
            ...state[action.payload.actionType],
            open: action.payload.open,
            maximized: action.payload.maximized,
          },
        };
      }

      return {
        ...newState,
      };
    }

    case DrawerActionTypes.SET_PREVIEW_PANEL: {
      return {
        ...state,
        ["preview"]: {
          open: true,
          maximized: false,
          currentlyActive: "preview",
        },
      };
    }

    case DrawerActionTypes.SET_CURRENTLY_ACTIVE: {
      return {
        ...state,
        [action.payload.panel]: {
          ...state[action.payload.panel],
          currentlyActive: action.payload.currentlyActive,
        },
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as drawerReducer };

export const getMaximizedObject = (
  state: IDrawerState,
  payload: DrawerPayloadType
) => {
  const newState = { ...state };
  for (const property in newState) {
    if (property !== payload.actionType) {
      newState[property].open = false;
      newState[property].maximized = false;
    } else {
      newState[property].open = payload.open;
      newState[property].maximized = payload.maximized;
    }
  }
  return newState;
};

export const getMinimizedObject = (
  state: IDrawerState,
  payload: DrawerPayloadType
) => {
  const newState = { ...state };

  for (const property in newState) {
    if (property !== payload.actionType) {
      newState[property].open = true;
      newState[property].maximized = false;
    } else {
      newState[property].open = payload.open;
      newState[property].maximized = payload.maximized;
    }
  }
  return newState;
};
