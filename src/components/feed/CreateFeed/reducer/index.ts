import {
  CreateFeedData,
  CreateFeedActions,
  CreateFeedState,
  Types,
} from "../types";

import { InputType } from "../../AddNode/types";

function getDefaultCreateFeedData(): CreateFeedData {
  return {
    feedName: "",
    feedDescription: "",
    tags: [],
    chrisFiles: [],
    localFiles: [],
    path: "",
    checkedKeys: [],
  };
}

export const initialState = {
  wizardOpen: false,
  step: 1,
  data: getDefaultCreateFeedData(),
  selectedPlugin: undefined,
  selectedConfig: "",
  requiredInput: {},
  dropdownInput: {},
  feedProgress: "",
  feedError: "",
  value: 0,
};

export const createFeedReducer = (
  state: CreateFeedState,
  action: CreateFeedActions
): CreateFeedState => {
  switch (action.type) {
    case Types.ToggleWizzard:
      return {
        ...state,
        wizardOpen: !state.wizardOpen,
      };
    case Types.SetStep:
      return {
        ...state,
        step: action.payload.id,
      };
    case Types.FeedDescriptionChange:
      return {
        ...state,
        data: { ...state.data, feedDescription: action.payload.value },
      };
    case Types.FeedNameChange:
      return {
        ...state,
        data: { ...state.data, feedName: action.payload.value },
      };
    case Types.TagsChange:
      return {
        ...state,
        data: {
          ...state.data,
          tags: action.payload.tags,
        },
      };
    case Types.SelectedConfig:
      return {
        ...state,
        selectedConfig: action.payload.selectedConfig,
      };
    case Types.AddChrisFile:
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [...state.data.chrisFiles, action.payload.file],
          path: action.payload.path,
          checkedKeys: action.payload.checkedKeys,
        },
      };
    case Types.RemoveChrisFile: {
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: state.data.chrisFiles.filter(
            (node) => node.title !== action.payload.file.title
          ),
          checkedKeys: action.payload.checkedKeys,
        },
      };
    }

    case Types.AddLocalFile:
      return {
        ...state,
        data: {
          ...state.data,
          localFiles: action.payload.files,
        },
      };

    case Types.RemoveLocalFile:
      return {
        ...state,
        data: {
          ...state.data,
          localFiles: state.data.localFiles.filter(
            (file) => file.name !== action.payload.filename
          ),
        },
      };

    case Types.SelectPlugin: {
      if (action.payload.checked === true) {
        return {
          ...state,
          selectedPlugin: action.payload.plugin,
        };
      } else {
        return {
          ...state,
          selectedPlugin: undefined,
        };
      }
    }

    case Types.DropdownInput: {
      return {
        ...state,
        dropdownInput: {
          ...state.dropdownInput,
          [action.payload.id]: action.payload.input,
        },
      };
    }

    case Types.RequiredInput: {
      return {
        ...state,
        requiredInput: {
          ...state.requiredInput,
          [action.payload.id]: action.payload.input,
        },
      };
    }

    case Types.DeleteInput: {
      const { dropdownInput } = state;
      const { input } = action.payload;

      let newObject = Object.entries(dropdownInput)
        .filter(([key, value]) => {
          return key !== input;
        })
        .reduce((acc: InputType, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return {
        ...state,
        dropdownInput: newObject,
      };
    }

    case Types.ResetState: {
      return {
        ...state,
        data: getDefaultCreateFeedData(),
        step: 1,
        selectedPlugin: undefined,
        selectedConfig: "",
        requiredInput: {},
        dropdownInput: {},
      };
    }

    case Types.SetProgress: {
      return {
        ...state,
        feedProgress: action.payload.feedProgress,
        value: state.value + 20,
      };
    }
    case Types.SetError: {
      return {
        ...state,
        feedError: action.payload.feedError,
      };
    }
    case Types.ResetProgress: {
      return {
        ...state,
        feedProgress: "",
        value: 0,
        feedError: "",
      };
    }

    default:
      return state;
  }
};
