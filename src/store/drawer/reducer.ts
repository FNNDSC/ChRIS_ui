import { Reducer } from "redux";
import { DrawerActionTypes, IDrawerState, DrawerPayloadType } from "./types";

const initialState: IDrawerState = {
  graph: {
    open: true,
    maximized: false,
    minimized: false,
  },
  node: {
    open: true,
    maximized: false,
    minimized: false,
  },
  directory: {
    open: true,
    maximized: false,
    minimized: false,
  },
  files: {
    open: true,
    maximized: false,
    minimized: false,
  },
  preview: {
    open: false,
    maximized: false,
    minimized: false,
  },
};

const reducer: Reducer<IDrawerState> = (state = initialState, action) => {
  switch (action.type) {
    case DrawerActionTypes.SET_DRAWER_STATE: {
      if (action.payload.maximized) {
        const newState = getNewObjectMaximized(action.payload);
        console.log("NEW STATE AFTER MAXIMIZED", newState);
        return {
          ...newState,
        };
      } else if (action.payload.minimized) {
        const newState = getNewObjectMinimized(action.payload);
        console.log("NEWSTATE AFTER MINIMIZED", newState);
        return {
          ...newState,
        };
      } else {
        return {
          ...state,
          [action.payload.actionType]: {
            minimized: action.payload.minimized,
            maximized: action.payload.maximized,
            open: action.payload.open,
          },
        };
      }
    }
    default: {
      return state;
    }
  }
};

export { reducer as drawerReducer };

const getNewObjectMaximized = (actionPayload: DrawerPayloadType) => {
  const newState = initialState;
  console.log("ActionPayload", actionPayload);

  for (const action in newState) {
    if (actionPayload.actionType === action) {
      newState[action].maximized = true;
    } else {
      newState[action].open = false;
      newState[action].maximized = false;
      newState[action].minimized = true;
    }
  }

  return newState;
};

const getNewObjectMinimized = (actionPayload: DrawerPayloadType) => {
  const newState = initialState;
  console.log("ActionPayload", actionPayload);

  for (const action in newState) {
    if (actionPayload.actionType === action) {
      newState[action].maximized=false
    } else {
      newState[action].minimized = false;
      newState[action].maximized = false;
      newState[action].open = true;
    }
  }

  return newState;
};
