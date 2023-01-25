import {
  CreateFeedData,
  CreateFeedActions,
  CreateFeedState,
  Types,
} from "../types/feed";
import { Key } from "rc-tree/lib/interface";
import { clearCache } from "../ChrisFileSelect";
import { State as MainRouterContextState } from "../../../../routes";
import { Series } from "../../../../pages/DataLibrary/Library";
import { InputType } from "../../AddNode/types";

function getDefaultCreateFeedData(selectedData?: Series): CreateFeedData {
  const initData = {
    feedName: "",
    feedDescription: "",
    tags: [],
    chrisFiles: [] as string[],
    localFiles: [],
    checkedKeys: {},
    isDataSelected: false,
  };

  if (selectedData && !!selectedData.length) {
    initData.chrisFiles = selectedData; //.map(({ data }) => data.fname);
    initData.isDataSelected = true;
  }

  return initData;
}

export function getInitialState(
  routerContextState?: typeof MainRouterContextState
): CreateFeedState {
  const selectedData = routerContextState?.selectData;
  const isInitDataSelected = !!selectedData?.length;

  return {
    // if data is selected, the user is navigated directly to create feed wizard
    wizardOpen: isInitDataSelected,
    step: 1,
    data: getDefaultCreateFeedData(selectedData),
    pluginMeta: undefined,
    selectedPluginFromMeta: undefined,
    selectedConfig: isInitDataSelected ? "swift_storage" : "",
    requiredInput: {},
    dropdownInput: {},
    feedProgress: "",
    feedError: "",
    value: 0,
    computeEnvironment: "",
    currentlyConfiguredNode: "",
  };
}

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
      clearCache();
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [],
          localFiles: [],
          checkedKeys: {},
        },
        requiredInput: {},
        dropdownInput: {},
        pluginMeta: undefined,
        selectedConfig: action.payload.selectedConfig,
      };
    case Types.AddChrisFile:
      const file = action.payload.file;
      const checkedKeysDict: {
        [key: string]: Key[];
      } = { ...state.data.checkedKeys };

      if (!state.data.checkedKeys[file]) {
        checkedKeysDict[file] = action.payload.checkedKeys;
      }

      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [...state.data.chrisFiles, action.payload.file],
          checkedKeys: checkedKeysDict,
        },
      };
    case Types.RemoveChrisFile: {
      let checkedKeysDict: {
        [key: string]: Key[];
      } = {};

      checkedKeysDict = Object.keys(state.data.checkedKeys).reduce(
        (object: { [key: string]: Key[] }, key) => {
          if (key !== action.payload.file) {
            object[key] = state.data.checkedKeys[key];
          }
          return object;
        },
        {}
      );

      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: state.data.chrisFiles.filter(
            (path) => path !== action.payload.file
          ),
          checkedKeys: checkedKeysDict,
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

    case Types.SelectPluginMeta: {
      if (action.payload.checked === true) {
        return {
          ...state,
          pluginMeta: action.payload.plugin,
        };
      } else {
        return {
          ...state,
          pluginMeta: undefined,
        };
      }
    }

    case Types.SelectPluginFromMeta: {
      return {
        ...state,
        selectedPluginFromMeta: action.payload.plugin,
      };
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
      const newObject = deleteObjectHelper(dropdownInput, input);
      return {
        ...state,
        dropdownInput: newObject,
      };
    }

    case Types.ResetState: {
      clearCache();
      return {
        ...state,
        data: getDefaultCreateFeedData(),
        step: 1,
        pluginMeta: undefined,
        selectedConfig: "",
        requiredInput: {},
        dropdownInput: {},
        computeEnvironment: "",
        value: 0,
        currentlyConfiguredNode: "",
      };
    }

    case Types.SetProgress: {
      return {
        ...state,
        feedProgress: action.payload.feedProgress,
        value: action.payload.value,
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

function deleteObjectHelper(dropdownInput: InputType, input: string) {
  const newObject = Object.entries(dropdownInput)
    .filter(([key]) => {
      return key !== input;
    })
    .reduce((acc: InputType, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  return newObject;
}
