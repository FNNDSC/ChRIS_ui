import { produce } from "immer";
import {
  type CreateFeedData,
  type CreateFeedActions,
  type CreateFeedState,
  Types,
} from "../types/feed";
import type { Key } from "rc-tree/lib/interface";
import type { State as MainRouterContextState } from "../../../routes";

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

const createFeedReducer = produce(
  (draft: CreateFeedState, action: CreateFeedActions) => {
    switch (action.type) {
      case Types.ToggleWizard: {
        draft.wizardOpen = !draft.wizardOpen;
        break;
      }

      case Types.SetStep: {
        draft.step = action.payload.id;
        break;
      }

      case Types.FeedDescriptionChange: {
        draft.data.feedDescription = action.payload.value;
        break;
      }

      case Types.FeedNameChange: {
        draft.data.feedName = action.payload.value;
        break;
      }

      case Types.TagsChange: {
        draft.data.tags = action.payload.tags;
        break;
      }

      case Types.SelectedConfig: {
        draft.selectedConfig = [...action.payload.selectedConfig];
        break;
      }

      case Types.AddChrisFile: {
        const file = action.payload.file;
        const checkedKeysDict: { [key: string]: Key[] } = {
          ...draft.data.checkedKeys,
        };

        if (!draft.data.checkedKeys[file]) {
          checkedKeysDict[file] = action.payload.checkedKeys;
        }

        draft.data.chrisFiles.push(file);
        draft.data.checkedKeys = checkedKeysDict;
        break;
      }

      case Types.RemoveChrisFile: {
        draft.data.chrisFiles = draft.data.chrisFiles.filter(
          (path) => path !== action.payload.file,
        );

        draft.data.checkedKeys = Object.keys(draft.data.checkedKeys).reduce(
          (object: { [key: string]: Key[] }, key) => {
            if (key !== action.payload.file) {
              object[key] = draft.data.checkedKeys[key];
            }
            return object;
          },
          {},
        );
        break;
      }

      case Types.ResetChrisFile: {
        draft.data.chrisFiles = [];
        draft.data.checkedKeys = {};
        break;
      }

      case Types.AddLocalFile: {
        draft.data.localFiles = action.payload.files;
        break;
      }

      case Types.RemoveLocalFile: {
        draft.data.localFiles = draft.data.localFiles.filter(
          (file) => file.name !== action.payload.filename,
        );
        break;
      }

      case Types.ResetState: {
        draft.data = getDefaultCreateFeedData();
        draft.step = 1;
        draft.uploadProgress = 0;
        draft.feedError = {};
        draft.creatingFeedStatus = "";
        draft.wizardOpen = false;
        draft.selectedConfig = [];
        break;
      }

      case Types.SetProgress: {
        draft.uploadProgress = action.payload.value;
        break;
      }

      case Types.SetError: {
        draft.feedError = action.payload.feedError;
        break;
      }

      case Types.SetFeedCreationState: {
        draft.creatingFeedStatus = action.payload.status;
        break;
      }

      default:
        break;
    }
  },
  getInitialState(), // Initialize with the default state
);

export { createFeedReducer };
