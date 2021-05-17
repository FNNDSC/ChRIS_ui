import { Reducer } from "redux";
import { IWorkflowState, WorkflowTypes, AnalysisStep } from "./types";

function getInitialSteps() {
  const steps: AnalysisStep[] = [];
  steps[0] = {
    id: 1,
    title: "Plugin Registration Check",
    status: "wait",
    description: "Check if pl-dircopy, pl-med2img, pl-covidnet is registered",
  };

  steps[1] = {
    id: 2,
    title: "Feed Created with Dircopy",
    status: "wait",
    description: "Create a Feed using pl-dircopy",
  };

  steps[2] = {
    id: 3,
    title: "Running pl-med2img",
    status: "wait",
    description: "Add pl-med2img to the feed tree",
  };

  steps[3] = {
    id: 4,
    title: "Running pl-covidnet",
    status: "wait",
    description: "Add pl-covidnet to the feed tree",
  };
  return steps;
}

export const initialState: IWorkflowState = {
  pacsPayload: {
    files: [],
    error: "",
    loading: false,
  },
  currentFile: undefined,
  steps: getInitialSteps(),
  isAnalysisRunning: false,
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
          files: action.payload,
          loading: false,
        },
      };
    }

    case WorkflowTypes.SET_CURRENT_FILE: {
      return {
        ...state,
        currentFile: action.payload,
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

      if (index == 3) {
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
