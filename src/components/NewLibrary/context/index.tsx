import type {
  FileBrowserFolder,
  FileBrowserFolderFile,
} from "@fnndsc/chrisapi";
import { createContext, useReducer } from "react";

export interface SelectionPayload {
  path: string;
  type: string;
  payload: FileBrowserFolderFile | FileBrowserFolder;
}

export interface LibraryState {
  openCart: boolean;
  selectedPaths: SelectionPayload[];
}

function getInitialState(): LibraryState {
  return {
    openCart: false,
    selectedPaths: [],
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
  CLEAR_CART = "CLEAR_CART",
  SET_TOGGLE_CART = "SET_TOGGLE_CART",
}

export type LibraryPayload = {
  [Types.SET_SELECTED_PATHS]: {
    path: string;
    type: string;
    payload: FileBrowserFolderFile | FileBrowserFolder;
  };
  [Types.CLEAR_SELECTED_PATHS]: {
    path: string;
  };
  [Types.CLEAR_CART]: Record<any, unknown>;
  [Types.SET_TOGGLE_CART]: null;
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
        selectedPaths: [...state.selectedPaths, action.payload],
      };
    }

    case Types.CLEAR_SELECTED_PATHS: {
      const newSelectedPaths = state.selectedPaths.filter((pathObj) => {
        return pathObj.path !== action.payload.path;
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

    case Types.SET_TOGGLE_CART: {
      return {
        ...state,
        openCart: !state.openCart,
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
