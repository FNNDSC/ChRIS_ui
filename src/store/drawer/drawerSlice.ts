import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DrawerState {
  open: boolean;
  maximized: boolean;
  minimized: boolean;
  currentlyActive: string;
}

export interface IDrawerState {
  graph: DrawerState;
  node: DrawerState;
  files: DrawerState;
  preview: DrawerState;
}

export interface DrawerPayloadType {
  actionType: keyof IDrawerState; // Adjusted to be more type-safe
  open: boolean;
  maximized: boolean;
  minimized: boolean;
}

const initialState: IDrawerState = {
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

const drawerSlice = createSlice({
  name: "drawer",
  initialState,
  reducers: {
    setDrawerState: (state, action: PayloadAction<DrawerPayloadType>) => {
      const { actionType, open, maximized, minimized } = action.payload;
      if (maximized) {
        getMaximizedObject(state, action.payload);
      } else if (minimized) {
        getMinimizedObject(state, action.payload);
      } else {
        state[actionType] = {
          ...state[actionType],
          open,
          maximized,
        };
      }
    },
    setFilePreviewPanel: (state) => {
      state.preview = {
        open: true,
        maximized: false,
        minimized: false,
        currentlyActive: "preview",
      };
    },
    setDrawerCurrentlyActive: (
      state,
      action: PayloadAction<{
        panel: keyof IDrawerState;
        currentlyActive: string;
      }>,
    ) => {
      const { panel, currentlyActive } = action.payload;
      state[panel].currentlyActive = currentlyActive;
    },
  },
});

export const { setDrawerState, setFilePreviewPanel, setDrawerCurrentlyActive } =
  drawerSlice.actions;
export default drawerSlice.reducer;

export const getMaximizedObject = (
  draft: IDrawerState,
  payload: DrawerPayloadType,
) => {
  for (const key in draft) {
    if (key !== payload.actionType) {
      draft[key as keyof IDrawerState].open = false;
      draft[key as keyof IDrawerState].maximized = false;
    } else {
      draft[key].open = payload.open;
      draft[key].maximized = payload.maximized;
    }
  }
};

export const getMinimizedObject = (
  draft: IDrawerState,
  payload: DrawerPayloadType,
) => {
  for (const key in draft) {
    if (key !== payload.actionType) {
      draft[key as keyof IDrawerState].open = true;
      draft[key as keyof IDrawerState].maximized = false;
    } else {
      draft[key].open = payload.open;
      draft[key].maximized = payload.maximized;
    }
  }
};
