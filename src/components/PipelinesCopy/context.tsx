import {
  ComputeResource,
  Pipeline,
  PipelinePipingDefaultParameterList,
  Plugin,
  PluginPiping,
} from "@fnndsc/chrisapi";
import { createContext, useReducer } from "react";

export type PerPipelinePayload = {
  parameters: PipelinePipingDefaultParameterList;
  pluginPipings: PluginPiping[];
  pipelinePlugins: Plugin[];
};

export enum Types {
  SetPipelines = "SET_PIPELINES",
  SetComputeInfo = "SET_COMPUTE_INFO",
  SetCurrentlyActiveNode = "SET_CURRENTLY_ACTIVE_NODE",
  SetChangeCompute = "SET_CHANGE_COMPUTE",
  SetChangeTitle = "SET_CHANGE_TITLE",
  PipelineToAdd = "PIPELINES_TO_ADD",
  ResetState = "RESET_STATE",
}

export type ComputeInfoPayload = {
  [key: string]: {
    computeEnvs: ComputeResource[];
    currentlySelected: string;
  };
};

export type ComputeInfoState = {
  [key: string]: ComputeInfoPayload;
};

export type TitleInfoState = {
  [key: string]: {
    [key: string]: string;
  };
};

type PipelinePayload = {
  [Types.SetPipelines]: {
    pipelineId: string;
  } & PerPipelinePayload;
  [Types.SetComputeInfo]: {
    pipelineId: string;
    computeEnvPayload: ComputeInfoPayload;
  };
  [Types.SetCurrentlyActiveNode]: {
    pipelineId: string;
    nodeId: string;
  };
  [Types.SetChangeCompute]: {
    pipelineId: string;
    nodeId: string;
    compute: string;
  };

  [Types.SetChangeTitle]: {
    pipelineId: string;
    nodeId: string;
    title: string;
  };

  [Types.PipelineToAdd]: {
    pipeline: Pipeline;
  };

  [Types.ResetState]: null;
};

type CurrentlyActiveNode = {
  [key: string]: string;
};

export interface PipelineState {
  selectedPipeline?: {
    [key: string]: PerPipelinePayload;
  };
  computeInfo?: ComputeInfoState;
  titleInfo?: TitleInfoState;
  currentlyActiveNode?: CurrentlyActiveNode;
  pipelineToAdd?: Pipeline;
}

export function getInitialPipelineState(): PipelineState {
  return {
    selectedPipeline: undefined,
    computeInfo: undefined,
    currentlyActiveNode: undefined,
    pipelineToAdd: undefined,
    titleInfo: undefined,
  };
}

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type PipelineActions =
  ActionMap<PipelinePayload>[keyof ActionMap<PipelinePayload>];

export const pipelineReducer = (
  state: PipelineState,
  action: PipelineActions,
) => {
  switch (action.type) {
    case Types.SetPipelines: {
      const { pipelineId, pluginPipings, parameters, pipelinePlugins } =
        action.payload;

      return {
        ...state,
        selectedPipeline: {
          ...state.selectedPipeline,
          [pipelineId]: {
            pluginPipings,
            parameters,
            pipelinePlugins,
          },
        },
      };
    }

    case Types.SetComputeInfo: {
      const { pipelineId, computeEnvPayload } = action.payload;

      return {
        ...state,
        computeInfo: {
          ...state.computeInfo,
          [pipelineId]: {
            ...state.computeInfo?.[pipelineId],
            ...computeEnvPayload,
          },
        },
      };
    }

    case Types.SetChangeTitle: {
      const { pipelineId, nodeId, title } = action.payload;

      return {
        ...state,
        titleInfo: {
          ...state.titleInfo,
          [pipelineId]: {
            ...state.titleInfo?.[pipelineId],
            [nodeId]: title,
          },
        },
      };
    }

    case Types.SetCurrentlyActiveNode: {
      const { pipelineId, nodeId } = action.payload;

      return {
        ...state,
        currentlyActiveNode: {
          ...state.currentlyActiveNode,
          [pipelineId]: nodeId,
        },
      };
    }

    case Types.SetChangeCompute: {
      const { pipelineId, nodeId, compute } = action.payload;

      const computeEnvs = state.computeInfo?.[pipelineId]?.[nodeId]
        ?.computeEnvs as ComputeResource[];

      return {
        ...state,
        computeInfo: {
          ...state.computeInfo,
          [pipelineId]: {
            ...state.computeInfo?.[pipelineId],
            [nodeId]: {
              computeEnvs: computeEnvs,
              currentlySelected: compute,
            },
          },
        },
      };
    }

    case Types.PipelineToAdd: {
      return {
        ...state,
        pipelineToAdd: action.payload.pipeline,
      };
    }

    case Types.ResetState: {
      const state = getInitialPipelineState();
      return state;
    }

    default:
      return state;
  }
};

const PipelineProvider = ({ children }: { children: React.ReactNode }) => {
  const initialPipelineState = getInitialPipelineState();
  const [state, dispatch] = useReducer(pipelineReducer, initialPipelineState);
  return (
    <PipelineContext.Provider value={{ state, dispatch }}>
      {children}
    </PipelineContext.Provider>
  );
};

const PipelineContext = createContext<{
  state: PipelineState;
  dispatch: any;
}>({
  state: getInitialPipelineState(),
  dispatch: () => null,
});

export { PipelineContext, PipelineProvider };
