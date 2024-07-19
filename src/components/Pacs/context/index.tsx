import React, { createContext, useReducer, type Dispatch } from "react";

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
  SET_SELECTED_PACS_SERVICE = "SET_SELECTED_PACS_SERVICE",
  SET_LIST_PACS_SERVICES = "SET_LIST_PACS_SERVICES",
  SET_CURRENT_QUERY_TYPE = "SET_CURRENT_QUERY_TYPE",
  SET_SEARCH_RESULT = "SET_SEARCH_RESULT",
  SET_QUERY_STAGE_FOR_SERIES = "SET_QUERY_STAGE_FOR_SERIES",
  SET_LOADING_SPINNER = "SET_LOADING_SPINNER",
  SET_DEFAULT_EXPANDED = "SET_DEFAULT_EXPANDED",
  SET_SHOW_PREVIEW = "SET_SHOW_PREVIEW",
  SET_PULL_STUDY = "SET_PULL_STUDY",
  SET_STUDY_PULL_TRACKER = "SET_STUDY_PULL_TRACKER",
  RESET_SEARCH_RESULTS = "RESET_SEARCH_RESULTS",
}

interface PacsQueryState {
  selectedPacsService: string;
  pacsServices: string[];
  currentQueryType: string;
  queryResult: Record<any, any>[];
  fetchingResults: { status: boolean; text: string };
  shouldDefaultExpanded: boolean;
  preview: boolean;
  pullStudy: {
    [key: string]: boolean;
  };
  studyPullTracker: {
    [key: string]: {
      [key: string]: boolean;
    };
  };
}

const initialState = {
  selectedPacsService: "",
  pacsServices: [],
  currentQueryType: "PatientID",
  queryResult: [],
  fetchingResults: { status: false, text: "" },
  shouldDefaultExpanded: false,
  preview: false,
  pullStudy: {},
  studyPullTracker: {},
};

type PacsQueryPayload = {
  [Types.SET_SELECTED_PACS_SERVICE]: {
    selectedPacsService: string;
  };

  [Types.SET_LIST_PACS_SERVICES]: {
    pacsServices: ReadonlyArray<string>;
  };

  [Types.SET_CURRENT_QUERY_TYPE]: {
    currentQueryType: string;
  };

  [Types.SET_SEARCH_RESULT]: {
    queryResult: Record<any, any>;
  };

  [Types.SET_QUERY_STAGE_FOR_SERIES]: {
    SeriesInstanceUID: string;
    queryStage: string;
  };

  [Types.SET_LOADING_SPINNER]: {
    status: boolean;
    text: string;
  };

  [Types.SET_DEFAULT_EXPANDED]: {
    expanded: boolean;
  };

  [Types.SET_SHOW_PREVIEW]: {
    preview: boolean;
  };

  [Types.SET_PULL_STUDY]: {
    studyInstanceUID: string;
    status: boolean;
  };

  [Types.SET_STUDY_PULL_TRACKER]: {
    studyInstanceUID: string;
    seriesInstanceUID: string;
    currentProgress: boolean;
  };

  [Types.RESET_SEARCH_RESULTS]: null;
};

export type PacsQueryActions =
  ActionMap<PacsQueryPayload>[keyof ActionMap<PacsQueryPayload>];

export const QueryStages: {
  [key: number]: string;
} = {
  0: "none",
  1: "retrieve",
  2: "push",
  3: "register",
  4: "completed",
};

export function getIndex(value: string) {
  for (const key in QueryStages) {
    if (QueryStages[key] === value) {
      return parseInt(key);
    }
  }
  return -1; // Return -1 if the value is not found in the object.
}

const PacsQueryContext = createContext<{
  state: PacsQueryState;
  dispatch: Dispatch<PacsQueryActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const pacsQueryReducer = (state: PacsQueryState, action: PacsQueryActions) => {
  switch (action.type) {
    case Types.SET_LIST_PACS_SERVICES: {
      return {
        ...state,
        pacsServices: action.payload.pacsServices,
      };
    }

    case Types.SET_SELECTED_PACS_SERVICE: {
      return {
        ...state,
        selectedPacsService: action.payload.selectedPacsService,
      };
    }

    case Types.SET_CURRENT_QUERY_TYPE: {
      return {
        ...state,
        currentQueryType: action.payload.currentQueryType,
      };
    }

    case Types.SET_SEARCH_RESULT: {
      return {
        ...state,
        queryResult: [...state.queryResult, action.payload.queryResult],
      };
    }

    case Types.RESET_SEARCH_RESULTS: {
      return {
        ...state,
        queryResult: [],
      };
    }

    case Types.SET_LOADING_SPINNER: {
      return {
        ...state,
        fetchingResults: {
          status: action.payload.status,
          text: action.payload.text,
        },
      };
    }

    case Types.SET_DEFAULT_EXPANDED: {
      return {
        ...state,
        shouldDefaultExpanded: action.payload.expanded,
      };
    }

    case Types.SET_SHOW_PREVIEW: {
      return {
        ...state,
        preview: action.payload.preview,
      };
    }

    case Types.SET_PULL_STUDY: {
      const { studyInstanceUID, status } = action.payload;
      return {
        ...state,
        pullStudy: {
          ...state.pullStudy,
          [studyInstanceUID]: status,
        },
      };
    }
    case Types.SET_STUDY_PULL_TRACKER: {
      const { studyInstanceUID, seriesInstanceUID, currentProgress } =
        action.payload;
      return {
        ...state,
        studyPullTracker: {
          ...state.studyPullTracker,
          [studyInstanceUID]: {
            ...state.studyPullTracker[studyInstanceUID],
            [seriesInstanceUID]: currentProgress,
          },
        },
      };
    }

    default:
      return state;
  }
};

const PacsQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(pacsQueryReducer, initialState);

  return (
    <PacsQueryContext.Provider value={{ state, dispatch }}>
      {children}
    </PacsQueryContext.Provider>
  );
};

export { PacsQueryContext, PacsQueryProvider };
