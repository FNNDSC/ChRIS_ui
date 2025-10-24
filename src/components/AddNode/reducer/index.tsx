import { produce } from "immer";
import { getInitialNodeState } from "../context";
import { type AddNodeState, type InputType, Types } from "../types";

export const addNodeReducer = produce((draft: AddNodeState, action: any) => {
  switch (action.type) {
    case Types.SetStepIdReached: {
      const { id } = action.payload;

      if (id === 1) {
        draft.dropdownInput = {};
        draft.requiredInput = {};
        draft.stepIdReached = id;
        draft.showPreviousRun = false;
      } else {
        draft.stepIdReached = id;
      }
      break;
    }

    case Types.SetPluginMeta: {
      draft.pluginMeta = action.payload.pluginMeta;
      break;
    }

    case Types.DeleteComponentList: {
      const id = action.payload.id;
      draft.componentList = draft.componentList.filter((key) => key !== id);
      draft.dropdownInput = Object.entries(draft.dropdownInput)
        .filter(([key]) => key !== id)
        .reduce((acc: InputType, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      break;
    }

    case Types.SetComponentList: {
      draft.componentList = action.payload.componentList;
      break;
    }

    case Types.SetSelectedPluginFromMeta: {
      draft.selectedPluginFromMeta = action.payload.plugin;
      break;
    }

    case Types.SetToggleWizard: {
      draft.isOpen = action.payload.isOpen;
      break;
    }

    case Types.DropdownInput: {
      const { input, editorValue } = action.payload;
      if (editorValue) {
        draft.dropdownInput = input;
      } else {
        Object.assign(draft.dropdownInput, input);
      }
      break;
    }

    case Types.RequiredInput: {
      const { input, editorValue } = action.payload;
      if (editorValue) {
        draft.requiredInput = input;
      } else {
        Object.assign(draft.requiredInput, input);
      }
      break;
    }

    case Types.SetEditorValue: {
      draft.editorValue = action.payload.value;
      break;
    }

    case Types.SetComputeEnv: {
      draft.selectedComputeEnv = action.payload.computeEnv;
      break;
    }

    case Types.SetShowPreviousRun: {
      draft.showPreviousRun = action.payload.showPreviousRun;
      break;
    }

    case Types.SetError: {
      draft.errors = action.payload.error;
      break;
    }

    case Types.AdvancedConfiguration: {
      draft.advancedConfig[action.payload.key] = action.payload.value;
      break;
    }

    case Types.MemoryLimitUnit: {
      draft.memoryLimit = action.payload.value;
      break;
    }

    case Types.ResetState: {
      return getInitialNodeState();
    }

    default:
      return draft;
  }
}, getInitialNodeState());
