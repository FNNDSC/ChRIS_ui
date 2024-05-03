import { getInitialNodeState } from "../context";
import { AddNodeState, Types, InputType } from "../types";

export const addNodeReducer = (state: AddNodeState, action: any) => {
  switch (action.type) {
    case Types.SetStepIdReached: {
      const { id } = action.payload;

      if (id === 1) {
        return {
          ...state,
          dropdownInput: {},
          requiredInput: {},
          stepIdReached: id,
          showPreviousRun: false,
        };
      }
      return {
        ...state,
        stepIdReached: id,
      };
    }

    case Types.SetPluginMeta: {
      return {
        ...state,
        pluginMeta: action.payload.pluginMeta,
      };
    }

    case Types.DeleteComponentList: {
      const id = action.payload.id;
      const filteredList = state.componentList.filter((key) => {
        return key !== id;
      });
      const newObject = Object.entries(state.dropdownInput)
        .filter(([key]) => {
          return key !== id;
        })
        .reduce((acc: InputType, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return {
        ...state,
        componentList: filteredList,
        dropdownInput: newObject,
      };
    }

    case Types.SetComponentList: {
      return {
        ...state,
        componentList: action.payload.componentList,
      };
    }

    case Types.SetSelectedPluginFromMeta: {
      return {
        ...state,
        selectedPluginFromMeta: action.payload.plugin,
      };
    }

    case Types.SetToggleWizard: {
      return {
        ...state,
        isOpen: action.payload.isOpen,
      };
    }

    case Types.DropdownInput: {
      const { input, editorValue } = action.payload;

      if (editorValue) {
        return {
          ...state,
          dropdownInput: input,
        };
      }
      return {
        ...state,
        dropdownInput: {
          ...state.dropdownInput,
          ...input,
        },
      };
    }

    case Types.RequiredInput: {
      const { input, editorValue } = action.payload;

      if (editorValue) {
        return {
          ...state,
          requiredInput: input,
        };
      }
      return {
        ...state,
        requiredInput: {
          ...state.requiredInput,
          ...input,
        },
      };
    }

    case Types.SetEditorValue: {
      return {
        ...state,
        editorValue: action.payload.value,
      };
    }

    case Types.SetComputeEnv: {
      return {
        ...state,
        selectedComputeEnv: action.payload.computeEnv,
      };
    }

    case Types.SetShowPreviousRun: {
      return {
        ...state,
        showPreviousRun: action.payload.showPreviousRun,
      };
    }

    case Types.SetError: {
      return {
        ...state,
        errors: {
          ...action.payload.error,
        },
      };
    }

    case Types.AdvancedConfiguration: {
      return {
        ...state,
        advancedConfig: {
          ...state.advancedConfig,
          [action.payload.key]: action.payload.value,
        },
      };
    }

    case Types.MemoryLimitUnit: {
      return {
        ...state,
        memoryLimit: action.payload.value,
      };
    }

    case Types.ResetState: {
      const newState = getInitialNodeState();

      return {
        ...newState,
      };
    }

    default:
      return state;
  }
};
