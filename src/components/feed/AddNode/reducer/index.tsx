import { AddNodeState, Types, InputType } from "../types";

export const addNodeReducer = (state: AddNodeState, action: any) => {
  switch (action.type) {
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
      const { input } = action.payload;

      return {
        ...state,
        dropdownInput: {
          ...state.dropdownInput,
          ...input,
        },
      };
    }

    case Types.RequiredInput: {
      const { input } = action.payload;
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

    default:
      return state;
  }
};
