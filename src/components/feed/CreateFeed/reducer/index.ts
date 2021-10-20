import {
  CreateFeedData,
  CreateFeedActions,
  CreateFeedState,
  Types,
} from "../types";
import { Key } from "rc-tree/lib/interface";
import { clearCache } from "../ChrisFileSelect";
import { State as MainRouterContextState } from "../../../../routes";
import { InputType } from "../../AddNode/types";
import { Series } from "../../../../pages/DataLibrary/Library";
import { merge } from "lodash";

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
    selectedPlugin: undefined,
    selectedConfig: isInitDataSelected ? "swift_storage" : "",
    requiredInput: {},
    dropdownInput: {},
    feedProgress: "",
    feedError: "",
    value: 0,
    computeEnvironment: " ",
    pipelineData: {},
    selectedPipeline: undefined,
    pipelines: [],
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
        selectedPlugin: undefined,

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

      const newObject = Object.entries(dropdownInput)
        .filter(([key]) => {
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
      clearCache();
      return {
        ...state,
        data: getDefaultCreateFeedData(),
        step: 1,
        selectedPlugin: undefined,
        selectedConfig: "",
        requiredInput: {},
        dropdownInput: {},
        computeEnvironment: "",
        pipelineData: {},
      };
    }

    case Types.SetProgress: {
      if (state.feedProgress.includes("Uploading Files To Cube")) {
        return {
          ...state,
          feedProgress: action.payload.feedProgress,
          value: state.value + 5,
        };
      } else {
        return {
          ...state,
          feedProgress: action.payload.feedProgress,
          value: state.value + 20,
        };
      }
    }

    case Types.SetPipelines: {
      return {
        ...state,
        pipelines: action.payload.pipelines,
      };
    }

    case Types.SetComputeEnvironment: {
      return {
        ...state,
        computeEnvironment: action.payload.computeEnvironment,
      };
    }

    case Types.AddPipeline: {
      return {
        ...state,
        pipelines: [...state.pipelines, action.payload.pipeline],
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

    case Types.SetPipelineResources: {
      const { pipelineId, pluginPipings, parameters, pipelinePlugins } =
        action.payload;
      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [pipelineId]: {
            pluginPipings,
            pluginParameters: parameters,
            pipelinePlugins,
            currentNode: undefined,
            computeEnvs: undefined,
          },
        },
      };
    }

    case Types.SetPipelineEnvironments: {
      const { computeEnvData, pipelineId } = action.payload;
      if (state.pipelineData[pipelineId].computeEnvs) {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [pipelineId]: {
              ...state.pipelineData[pipelineId],
              computeEnvs: merge(
                state.pipelineData[pipelineId].computeEnvs,
                computeEnvData
              ),
            },
          },
        };
      } else {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [pipelineId]: {
              ...state.pipelineData[pipelineId],
              computeEnvs: computeEnvData,
            },
          },
        };
      }
    }

    case Types.SetCurrentNode: {
      const { pipelineId, currentNode: pluginName } = action.payload;
      const { computeEnvs } = state.pipelineData[pipelineId];

      console.log("PluginName", pluginName);


      if (computeEnvs) {
        const computeEnvArray = computeEnvs[pluginName].computeEnvs;
        const currentComputeEnv = computeEnvs[pluginName].currentlySelected;
        const findIndex = computeEnvArray?.findIndex(
          (env) => env.name === currentComputeEnv
        );
        let currentlySelected;

        if (computeEnvArray) {
          if (findIndex === computeEnvArray.length - 1) {
            currentlySelected = computeEnvArray[0];
          } else if (typeof findIndex === "number") {
            currentlySelected = computeEnvArray[findIndex + 1];
          }
        }

        if (currentlySelected) {
          const duplicateObject = computeEnvs;
          duplicateObject[pluginName].currentlySelected =
            currentlySelected.name;

          return {
            ...state,
            pipelineData: {
              ...state.pipelineData,
              [pipelineId]: {
                ...state.pipelineData[pipelineId],
                currentNode: pluginName,
                computeEnvs: duplicateObject,
              },
            },
          };
        }
      }

      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [pipelineId]: {
            ...state.pipelineData[pipelineId],
            currentNode: action.payload.currentNode,
          },
        },
      };
    }

    case Types.SetExpandedPipelines: {
      const { pipelineId } = action.payload;

      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [pipelineId]: {
            pipelineId,
          },
        },
      };
    }

    case Types.SetCurrentPipeline: {
      const { pipelineId } = action.payload;
      return {
        ...state,
        selectedPipeline: pipelineId,
      };
    }

    default:
      return state;
  }
};
