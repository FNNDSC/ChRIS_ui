import {
  CreateFeedData,
  CreateFeedActions,
  CreateFeedState,
  Types,
} from "../types/feed";
import { Key } from "rc-tree/lib/interface";
import { State as MainRouterContextState } from "../../../App";

/*
import { Series } from "../../../../pages/DataLibrary/Library";
*/

function getDefaultCreateFeedData(selectedData?: any[]): CreateFeedData {
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
  routerContextState?: typeof MainRouterContextState,
): CreateFeedState {
  const selectedData = routerContextState?.selectData;
  const isInitDataSelected = !!selectedData?.length;

  return {
    // if data is selected, the user is navigated directly to create feed wizard
    wizardOpen: isInitDataSelected,
    step: 1,
    data: getDefaultCreateFeedData(selectedData),
    selectedConfig: isInitDataSelected ? ["swift_storage"] : [],
    uploadProgress: 0,
    feedError: {},
    creatingFeedStatus: "",
  };
}

export const createFeedReducer = (
  state: CreateFeedState,
  action: CreateFeedActions,
): CreateFeedState => {
  switch (action.type) {
    case Types.ToggleWizard:
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
      //  clearCache();
      return {
        ...state,
        selectedConfig: [...action.payload.selectedConfig],
      };
    case Types.AddChrisFile: {
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
    }
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
        {},
      );

      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: state.data.chrisFiles.filter(
            (path) => path !== action.payload.file,
          ),
          checkedKeys: checkedKeysDict,
        },
      };
    }

    case Types.ResetChrisFile: {
      return {
        ...state,
        data: {
          ...state.data,
          chrisFiles: [],
          checkedKeys: {},
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
            (file) => file.name !== action.payload.filename,
          ),
        },
      };

    case Types.ResetState: {
      //clearCache();
      return {
        ...state,
        data: getDefaultCreateFeedData(),
        step: 1,
        uploadProgress: 0,
        feedError: {},
        creatingFeedStatus: "",
        wizardOpen: false,
        selectedConfig: [],
      };
    }

    case Types.SetProgress: {
      return {
        ...state,
        uploadProgress: action.payload.value,
      };
    }

    case Types.SetError: {
      return {
        ...state,
        feedError: action.payload.feedError,
      };
    }

    case Types.SetFeedCreationState: {
      return {
        ...state,
        creatingFeedStatus: action.payload.status,
      };
    }

    default:
      return state;
  }
};
