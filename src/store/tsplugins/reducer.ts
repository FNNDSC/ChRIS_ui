import { Reducer } from "redux";
import { ITSPluginState, TSPluginTypes } from "./types";

export const initialState: ITSPluginState = {
  treeMode: true,
  tsNodes: undefined,
};

const reducer: Reducer<ITSPluginState> = (state = initialState, action) => {
  switch (action.type) {
    case TSPluginTypes.ADD_TS_NODE: {
      if (!state.tsNodes) {
        return {
          ...state,
          tsNodes: [action.payload],
        };
      } else {
        const node = state.tsNodes.find(
          (node) => node.data.id === action.payload.data.id
        );

        if (node) {
          const filteredNodes = state.tsNodes.filter(
            (node) => node.data.id !== action.payload.data.id
          );
          return {
            ...state,
            tsNodes: filteredNodes,
          };
        } else
          return {
            ...state,
            tsNodes: [...state.tsNodes, action.payload],
          };
      }
    }

    case TSPluginTypes.DELETE_TS_NODE: {
      if (state.tsNodes) {
        const filteredNodes = state.tsNodes.filter(
          (node) => node.data.id !== action.payload.data.id
        );
        return {
          ...state,
          tsNodes: filteredNodes,
        };
      } else return { ...state };
    }

    case TSPluginTypes.SWITCH_TREE_MODE: {
      return {
        ...state,
        treeMode: action.payload,
        tsNodes: [],
      };
    }

    case TSPluginTypes.RESET_TS_NODES: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};

export { reducer as tsPluginsReducer };
