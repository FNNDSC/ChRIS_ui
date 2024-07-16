import type { Reducer } from "redux";
import { type ICartState, ICartActionTypes } from "./types";

const initialState: ICartState = {
  selectedPaths: [],
  openCart: false,
};

const reducer: Reducer<ICartState> = (
  state = initialState,
  action: typeof ICartActionTypes,
) => {
  switch (action.type) {
    case ICartActionTypes.SET_SELECTED_PATHS: {
      return {
        ...state,
        selectedPaths: [...state.selectedPaths, action.payload],
      };
    }
    case ICartActionTypes.CLEAR_SELECTED_PATHS: {
      const newSelectedPaths = state.selectedPaths.filter((pathObj) => {
        return pathObj.path !== action.payload.path;
      });
      return {
        ...state,
        selectedPaths: newSelectedPaths,
      };
    }

    case ICartActionTypes.SET_TOGGLE_CART: {
      return {
        ...state,
        openCart: !state.openCart,
      };
    }

    default: {
      return state;
    }
  }
};

export { reducer as cartReducer };
