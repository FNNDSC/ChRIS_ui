import { produce } from "immer";
import type { Reducer } from "redux";
import { type ITSPluginState, TSPluginTypes } from "./types";

export const initialState: ITSPluginState = {
  treeMode: true,
  tsNodes: undefined,
};

const reducer: Reducer<ITSPluginState, typeof TSPluginTypes> = produce(
  (draft: ITSPluginState, action: typeof TSPluginTypes) => {
    switch (action.type) {
      case TSPluginTypes.ADD_TS_NODE: {
        if (!draft.tsNodes) {
          draft.tsNodes = [action.payload];
        } else {
          const nodeIndex = draft.tsNodes.findIndex(
            (node) => node.data.id === action.payload.data.id,
          );

          if (nodeIndex !== -1) {
            draft.tsNodes.splice(nodeIndex, 1);
          } else {
            draft.tsNodes.push(action.payload);
          }
        }
        break;
      }

      case TSPluginTypes.DELETE_TS_NODE: {
        if (draft.tsNodes) {
          draft.tsNodes = draft.tsNodes.filter(
            (node) => node.data.id !== action.payload.data.id,
          );
        }
        break;
      }

      case TSPluginTypes.SWITCH_TREE_MODE: {
        draft.treeMode = action.payload;
        draft.tsNodes = [];
        break;
      }

      case TSPluginTypes.RESET_TS_NODES: {
        return initialState;
      }

      default:
        return draft;
    }
  },
  initialState,
);

export { reducer as tsPluginsReducer };
