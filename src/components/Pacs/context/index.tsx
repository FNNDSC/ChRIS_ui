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
  SET_SERIES_PREVIEWS = "SET_SERIES_PREVIEWS",
  RESET_SERIES_PREVIEWS = "RESET_SERIES_PREVIEWS",
  SET_PULL_STUDY = "SET_PULL_STUDY",
  SET_SERIES_UPDATE = "SET_SERIES_UPDATE",
}

interface PacsQueryState {
  selectedPacsService: string;
  pacsServices: string[];
  currentQueryType: string;
  queryResult: Record<any, any>[];
  queryStageForSeries: Record<any, any>;
  fetchingResults: { status: boolean; text: string };
  shouldDefaultExpanded: boolean;
  preview: boolean;
  seriesPreviews: {
    [key: string]: boolean;
  };
  pullStudy: boolean;
  seriesUpdate: {
    [key: string]: Record<string, string>;
  };
}

const initialState = {
  selectedPacsService: "",
  pacsServices: [],
  currentQueryType: "PatientID",
  queryResult: [],
  queryStageForSeries: {},
  fetchingResults: { status: false, text: "" },
  shouldDefaultExpanded: false,
  preview: false,
  pullStudy: false,
  seriesUpdate: {},
  seriesPreviews: {},
};

type PacsQueryPayload = {
  [Types.SET_SELECTED_PACS_SERVICE]: {
    selectedPacsService: string;
  };

  [Types.SET_LIST_PACS_SERVICES]: {
    pacsServices: string[];
  };

  [Types.SET_CURRENT_QUERY_TYPE]: {
    currentQueryType: string;
  };

  [Types.SET_SEARCH_RESULT]: {
    queryResult: Record<any, any>[];
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

  [Types.SET_SERIES_PREVIEWS]: {
    seriesID: number;
    preview: boolean;
  };

  [Types.RESET_SERIES_PREVIEWS]: {
    clearSeriesPreview: boolean;
  };

  [Types.SET_PULL_STUDY]: null;

  [Types.SET_SERIES_UPDATE]: {
    currentStep: string;
    seriesInstanceUID: string;
    studyInstanceUID: string;
  };
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
        queryResult: action.payload.queryResult,
      };
    }

    case Types.SET_QUERY_STAGE_FOR_SERIES: {
      return {
        ...state,
        queryStageForSeries: {
          ...state.queryStageForSeries,
          [action.payload.SeriesInstanceUID]: action.payload.queryStage,
        },
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

    case Types.SET_SERIES_PREVIEWS: {
      return {
        ...state,
        seriesPreviews: {
          ...state.seriesPreviews,
          [action.payload.seriesID]: action.payload.preview,
        },
      };
    }

    case Types.RESET_SERIES_PREVIEWS: {
      return {
        ...state,
        seriesPreviews: {},
      };
    }

    case Types.SET_PULL_STUDY: {
      return {
        ...state,
        pullStudy: !state.pullStudy,
      };
    }

    case Types.SET_SERIES_UPDATE: {
      const { seriesInstanceUID, studyInstanceUID, currentStep } =
        action.payload;

      return {
        ...state,
        seriesUpdate: {
          [studyInstanceUID]: {
            ...state.seriesUpdate[studyInstanceUID],
            [seriesInstanceUID]: currentStep,
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
