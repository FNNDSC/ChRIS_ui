import { produce } from "immer";
import type { Reducer } from "redux";
import { ExplorerActionTypes, type IExplorerState } from "./types";

const initialState: IExplorerState = {
  selectedFile: undefined,
};

const reducer: Reducer<IExplorerState> = produce(
  (draft: IExplorerState, action: typeof ExplorerActionTypes) => {
    switch (action.type) {
      case ExplorerActionTypes.SET_SELECTED_FILE: {
        draft.selectedFile = action.payload;
        break;
      }

      case ExplorerActionTypes.CLEAR_SELECTED_FILE: {
        draft.selectedFile = undefined;
        break;
      }

      default: {
        return draft;
      }
    }
  },
  initialState,
);

export { reducer as explorerReducer };
