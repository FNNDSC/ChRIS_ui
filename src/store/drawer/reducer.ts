import { Reducer } from "redux";
import { DrawerActionTypes, IDrawerState, DrawerPayloadType } from "./types";

const initialState: IDrawerState = {
  graph: {
    open: true,
    maximized: false,
  },
  node: {
    open: true,
    maximized: false,
  },
  directory: {
    open: true,
    maximized: false,
  },
  files: {
    open: true,
    maximized: false,
  },
  preview: {
    open: false,
    maximized: false,
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
  const newState = state;
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
  const newState = state;

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
