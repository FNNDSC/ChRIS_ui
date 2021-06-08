import { Reducer } from "redux";
import { IWorkflowState, WorkflowTypes, AnalysisStep } from "./types";

function getInitialSteps() {
  const steps: AnalysisStep[] = [];
  steps[0] = {
    id: 1,
    title: "Checking if the plugins are registered to cube",
    status: "wait",
    error: "",
  };

  steps[1] = {
    id: 2,
    title: "Creating a Feed",
    status: "wait",
    error: "",
  };

  steps[2] = {
    id: 3,
    title: "Scheduling jobs ",
    status: "wait",
    error: "",
  };

  steps[3] = {
    id: 4,
    title: "Finishing up",
    status: "wait",
    error: "",
  };
  return steps;
}

export const initialState: IWorkflowState = {
  pacsPayload: {
    files: [],
    error: "",
    loading: false,
  },
  localfilePayload: {
    files: [],
    error: "",
    loading: false,
  },
  currentPacsFile: [],
  steps: getInitialSteps(),
  isAnalysisRunning: false,
  totalFileCount: 0,
  optionState: {
    isOpen: false,
    toggleTemplateText: "Choose a Workflow",
    selectedOption: "",
  },
  checkFeedDetails: undefined,
};

const reducer: Reducer<IWorkflowState> = (state = initialState, action) => {
  switch (action.type) {
    case WorkflowTypes.GET_PACS_FILES_REQUEST: {
      return {
        ...state,
        pacsPayload: {
          ...state.pacsPayload,
          loading: true,
        },
      };
    }

    case WorkflowTypes.GET_PACS_FILES_SUCCESS: {
      return {
        ...state,
        pacsPayload: {
          ...state.pacsPayload,
          files: action.payload.files,
          loading: false,
        },
        totalFileCount: action.payload.totalFileCount,
      };
    }

    case WorkflowTypes.SET_LOCAL_FILE: {
      return {
        ...state,
        localfilePayload: {
          ...state.localfilePayload,
          files: action.payload,
        },
      };
    }

    case WorkflowTypes.SET_CURRENT_FILE: {
      return {
        ...state,
        currentPacsFile: [...state.currentPacsFile, action.payload],
      };
    }

    case WorkflowTypes.SET_OPTION_STATE: {
      return {
        ...state,
        optionState: action.payload,
      };
    }

    case WorkflowTypes.SUBMIT_ANALYSIS: {
      return {
        ...state,
        isAnalysisRunning: true,
      };
    }

    case WorkflowTypes.SET_ANALYSIS_STEP: {
      const cloneSteps = [...state.steps];
      const index = cloneSteps.findIndex(
        (step) => step.id === action.payload.id
      );
      cloneSteps[index] = action.payload;

      if (index == 4) {
        return {
          ...state,
          steps: cloneSteps,
          isAnalysisRunning: !state.isAnalysisRunning,
        };
      } else
        return {
          ...state,
          steps: cloneSteps,
        };
    }

    case WorkflowTypes.SET_FEED_DETAILS: {
      return {
        ...state,
        checkFeedDetails: action.payload,
      };
    }

    case WorkflowTypes.RESET_WORKFLOW_STEP: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
};

export { reducer as workflowsReducer };
