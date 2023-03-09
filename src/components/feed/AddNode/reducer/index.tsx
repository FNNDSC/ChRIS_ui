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
      } else {
        return {
          ...state,
          stepIdReached: id,
        };
      }
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

    case Types.SetPluginMetaList: {
      return {
        ...state,
        pluginMetas: action.payload.pluginMetas,
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
      } else {
        return {
          ...state,
          dropdownInput: {
            ...state.dropdownInput,
            ...input,
          },
        };
      }
    }

    case Types.RequiredInput: {
      const { input, editorValue } = action.payload;

      if (editorValue) {
        return {
          ...state,
          requiredInput: input,
        };
      } else {
        return {
          ...state,
          requiredInput: {
            ...state.requiredInput,
            ...input,
          },
        };
      }
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
          ...state.errors,
          ...action.payload.error,
        },
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
