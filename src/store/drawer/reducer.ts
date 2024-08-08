import { produce } from "immer";
import type { Reducer } from "redux";
import {
  DrawerActionTypes,
  type DrawerPayloadType,
  type IDrawerState,
} from "./types";

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
  files: {
    open: true,
    maximized: false,
    currentlyActive: "files",
  },
  preview: {
    open: false,
    maximized: false,
    currentlyActive: "preview",
  },
};

const reducer: Reducer<IDrawerState> = produce(
  (draft: IDrawerState, action: typeof DrawerActionTypes) => {
    switch (action.type) {
      case DrawerActionTypes.SET_DRAWER_STATE: {
        if (action.payload.maximized === true) {
          getMaximizedObject(draft, action.payload);
        } else if (action.payload.minimized === true) {
          getMinimizedObject(draft, action.payload);
        } else {
          draft[action.payload.actionType] = {
            ...draft[action.payload.actionType],
            open: action.payload.open,
            maximized: action.payload.maximized,
          };
        }
        break;
      }

      case DrawerActionTypes.SET_PREVIEW_PANEL: {
        draft.preview = {
          open: true,
          maximized: false,
          currentlyActive: "preview",
        };
        break;
      }

      case DrawerActionTypes.SET_CURRENTLY_ACTIVE: {
        draft[action.payload.panel].currentlyActive =
          action.payload.currentlyActive;
        break;
      }

      default: {
        return draft;
      }
    }
  },
  initialState,
);

export { reducer as drawerReducer };

export const getMaximizedObject = (
  draft: IDrawerState,
  payload: DrawerPayloadType,
) => {
  for (const property in draft) {
    if (property !== payload.actionType) {
      draft[property].open = false;
      draft[property].maximized = false;
    } else {
      draft[property].open = payload.open;
      draft[property].maximized = payload.maximized;
    }
  }
};

export const getMinimizedObject = (
  draft: IDrawerState,
  payload: DrawerPayloadType,
) => {
  for (const property in draft) {
    if (property !== payload.actionType) {
      draft[property].open = true;
      draft[property].maximized = false;
    } else {
      draft[property].open = payload.open;
      draft[property].maximized = payload.maximized;
    }
  }
};
