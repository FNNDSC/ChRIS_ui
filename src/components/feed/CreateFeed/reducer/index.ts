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
    pipelineName: "",
    pipelines: [],
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

    case Types.SetPipelineName: {
      return {
        ...state,
        pipelineName: action.payload.pipelineName,
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

    case Types.DeslectPipeline: {
      return {
        ...state,
        pipelineData: {},
        pipelineName: "",
        selectedPipeline: undefined,
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

    case Types.SetPipelineDropdownInput: {
      const { currentPipelineId, currentNodeId, id, input } = action.payload;

      if (
        state.pipelineData[currentPipelineId] &&
        state.pipelineData[currentPipelineId].input &&
        state.pipelineData[currentPipelineId].input[currentNodeId]
      ) {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              input: {
                ...state.pipelineData[currentPipelineId].input,
                [currentNodeId]: {
                  ...state.pipelineData[currentPipelineId].input[currentNodeId],
                  dropdownInput: {
                    ...state.pipelineData[currentPipelineId].input[
                      currentNodeId
                    ].dropdownInput,
                    [id]: input,
                  },
                },
              },
            },
          },
        };
      } else if (state.pipelineData[currentPipelineId]) {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              input: {
                ...state.pipelineData[currentPipelineId].input,
                [currentNodeId]: {
                  requiredInput: {},
                  dropdownInput: {
                    [id]: input,
                  },
                },
              },
            },
          },
        };
      } else
        return {
          ...state,
        };
    }

    case Types.SetPipelineRequiredInput: {
      const { currentPipelineId, currentNodeId, id, input } = action.payload;

      if (
        state.pipelineData[currentPipelineId] &&
        state.pipelineData[currentPipelineId].input &&
        state.pipelineData[currentPipelineId].input[currentNodeId]
      ) {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              input: {
                ...state.pipelineData[currentPipelineId].input,
                [currentNodeId]: {
                  ...state.pipelineData[currentPipelineId].input[currentNodeId],
                  requiredInput: {
                    ...state.pipelineData[currentPipelineId].input[
                      currentNodeId
                    ].requiredInput,
                    [id]: input,
                  },
                },
              },
            },
          },
        };
      } else if (state.pipelineData[currentPipelineId]) {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              input: {
                ...state.pipelineData[currentPipelineId].input,
                [currentNodeId]: {
                  dropdownInput: {},
                  requiredInput: {
                    [id]: input,
                  },
                },
              },
            },
          },
        };
      } else
        return {
          ...state,
        };
    }

    case Types.SetCurrentNodeTitle: {
      const { currentPipelineId, currentNode, title } = action.payload;
      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [currentPipelineId]: {
            ...state.pipelineData[currentPipelineId],
            title: {
              ...state.pipelineData[currentPipelineId].title,
              [currentNode]: title,
            },
          },
        },
      };
    }

    case Types.DeletePipelineInput: {
      const { input, currentPipelineId, currentNodeId } = action.payload;
      if (
        state.pipelineData[currentPipelineId] &&
        state.pipelineData[currentPipelineId].input[currentNodeId].dropdownInput
      ) {
        const dropdownInput =
          state.pipelineData[currentPipelineId] &&
          state.pipelineData[currentPipelineId].input[currentNodeId]
            .dropdownInput;
        const newObject = deleteObjectHelper(dropdownInput, input);

        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              input: {
                ...state.pipelineData[currentPipelineId].input,
                [currentNodeId]: {
                  ...state.pipelineData[currentPipelineId].input[currentNodeId],
                  dropdownInput: newObject,
                },
              },
            },
          },
        };
      }

      return {
        ...state,
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
        selectedPlugin: undefined,
        selectedConfig: "",
        requiredInput: {},
        dropdownInput: {},
        computeEnvironment: "",
        value: 0,
        pipelineData: {},
        pipelineName: "",
        pipelines: [],
        currentlyConfiguredNode: "",
      };
    }

    case Types.SetProgress: {
      return {
        ...state,
        feedProgress: action.payload.feedProgress,
        value: state.value + 20,
      };
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

    case Types.SetCurrentComputeEnvironment: {
      const { item, currentNode, currentPipelineId, computeEnvList } =
        action.payload.computeEnv;

      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [currentPipelineId]: {
            ...state.pipelineData[currentPipelineId],
            computeEnvs: {
              ...state.pipelineData[currentPipelineId].computeEnvs,
              [currentNode]: {
                computeEnvs: computeEnvList,
                currentlySelected: item.name,
              },
            },
          },
        },
      };
    }

    case Types.SetGeneralCompute: {
      const { currentPipelineId, computeEnv } = action.payload;

      if (state.pipelineData[currentPipelineId].computeEnvs) {
        const computeEnvs = state.pipelineData[currentPipelineId].computeEnvs;

        if (computeEnvs) {
          for (const id in computeEnvs) {
            const currentComputeEnvs = computeEnvs[id].computeEnvs;
            const names = currentComputeEnvs.map((env) => env.name);
            if (names.includes(computeEnv)) {
              computeEnvs[id].currentlySelected = computeEnv;
            }
          }
        }

        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              computeEnvs,
              generalCompute: computeEnv,
            },
          },
        };
      } else {
        return {
          ...state,
          pipelineData: {
            ...state.pipelineData,
            [currentPipelineId]: {
              ...state.pipelineData[currentPipelineId],
              generalCompute: computeEnv,
            },
          },
        };
      }
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
      const { pipelineId, currentNode } = action.payload;
      return {
        ...state,
        pipelineData: {
          ...state.pipelineData,
          [pipelineId]: {
            ...state.pipelineData[pipelineId],
            currentNode,
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
