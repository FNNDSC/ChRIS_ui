import React, { createContext, useReducer } from "react";

interface LibraryState {
  selectedPaths: string[];
  previewAll: boolean;
}

function getInitialState(): LibraryState {
  return {
    selectedPaths: [],
    previewAll: false,
  };
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  SET_SELECTED_PATHS = "SET_SELECTED_PATHS",
  CLEAR_SELECTED_PATHS = "CLEAR_SELECTED_PATHS",
  SET_PREVIEW_ALL = "SET_PREVIEW_ALL",
  CLEAR_CART = "CLEAR_CART",
}

export type LibraryPayload = {
  [Types.SET_SELECTED_PATHS]: {
    path: string;
  };
  [Types.CLEAR_SELECTED_PATHS]: {
    path: string;
  };
  [Types.SET_PREVIEW_ALL]: {
    previewAll: boolean;
  };
  [Types.CLEAR_CART]: Record<any, unknown>;
};

export type LibraryActions =
  ActionMap<LibraryPayload>[keyof ActionMap<LibraryPayload>];

const LibraryContext = createContext<{
  state: LibraryState;
  dispatch: React.Dispatch<any>;
}>({
  state: getInitialState(),
  dispatch: () => null,
});

export const libraryReducer = (
  state: LibraryState,
  action: LibraryActions,
): LibraryState => {
  switch (action.type) {
    case Types.SET_SELECTED_PATHS: {
      return {
        ...state,
        selectedPaths: [...state.selectedPaths, action.payload.path],
      };
    }

    case Types.CLEAR_SELECTED_PATHS: {
      const newSelectedPaths = state.selectedPaths.filter((path) => {
        return path !== action.payload.path;
      });
      return {
        ...state,
        selectedPaths: newSelectedPaths,
      };
    }

    case Types.CLEAR_CART: {
      return {
        ...state,
        selectedPaths: [],
      };
    }

    default:
      return state;
  }
};

interface LibraryProviderProps {
  children: React.ReactNode;
}

const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const initialState = getInitialState();
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  return (
    <LibraryContext.Provider value={{ state, dispatch }}>
      {children}
    </LibraryContext.Provider>
  );
};

export { LibraryContext, LibraryProvider };
