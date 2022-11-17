import {
  PipelineActions,
  PipelineState,
  PipelineTypes,
} from "../types/pipeline";
import { InputType } from "../../AddNode/types";
import { merge } from "lodash";

export function getInitialPipelineState() {
  return {
    pipelineData: {},
    pipelineName: "",
    pipelines: [],
  };
}

export const pipelineReducer = (
  state: PipelineState,
  action: PipelineActions
) => {
  switch (action.type) {
    case PipelineTypes.DeselectPipeline: {
      return {
        ...state,
        selectedPipeline: undefined,
      };
    }
    case PipelineTypes.SetPipelines: {
      return {
        ...state,
        pipelines: action.payload.pipelines,
      };
    }

    case PipelineTypes.AddPipeline: {
      return {
        ...state,
        pipelines: [...state.pipelines, action.payload.pipeline],
      };
    }
    case PipelineTypes.SetPipelineResources: {
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

    case PipelineTypes.SetCurrentComputeEnvironment: {
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

    case PipelineTypes.SetGeneralCompute: {
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

    case PipelineTypes.SetPipelineEnvironments: {
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

    case PipelineTypes.SetCurrentNode: {
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

    case PipelineTypes.SetCurrentPipeline: {
      const { pipelineId } = action.payload;
      return {
        ...state,
        selectedPipeline: pipelineId,
      };
    }

    case PipelineTypes.SetPipelineDropdownInput: {
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

    case PipelineTypes.SetPipelineRequiredInput: {
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

    case PipelineTypes.SetCurrentNodeTitle: {
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

    case PipelineTypes.DeletePipelineInput: {
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
