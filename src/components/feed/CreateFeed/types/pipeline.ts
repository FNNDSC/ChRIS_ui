import { PluginPiping } from "@fnndsc/chrisapi";
import { InputIndex, InputType } from "../../AddNode/types";

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

export enum PipelineTypes {
  SetComputeEnvironment = "SET_COMPUTE_ENVIRONMENT",
  SetCurrentPipeline = "SET_CURRENT_PIPELINE",
  SetPipelineResources = "SET_PIPELINE_RESOURCES",
  SetPipelines = "SET_PIPELINES",
  SetPipelineEnvironments = "SET_PIPELINE_ENVIRONMENTS",
  SetCurrentNode = "SET_CURRENT_NODE",
  SetExpandedPipelines = "SET_EXPANDED_PIPELINES",
  AddPipeline = "ADD_PIPELINE",
  SetPipelineName = "SET_PIPELINE_NAME",
  DeselectPipeline = "DESELECT_PIPELINE",
  SetCurrentNodeTitle = "SET_CURRENT_NODE_TITLE",
  SetCurrentComputeEnvironment = "SET_CURRENT_COMPUTE_ENVIRONMENT",
  SetPipelineDropdownInput = "SET_PIPELINE_DROPDOWN_INPUT",
  SetPipelineRequiredInput = "SET_PIPELINE_REQUIRED_INPUT",
  DeletePipelineInput = "DELETE_PIPELINE_INPUT",
  SetDefaultParameters = "SET_DEFAULT_PARAMETERS",
  SetGeneralCompute = "SET_GENERAL_COMPUTE",
}

export interface ComputeEnvData {
  [key: string]: { computeEnvs: any[]; currentlySelected: any };
}

type PipelinePayload = {
  [PipelineTypes.SetComputeEnvironment]: {
    computeEnvironment: string;
  };
  [PipelineTypes.DeletePipelineInput]: {
    input: string;
    currentPipelineId: number;
    currentNodeId: number;
  };
  [PipelineTypes.SetPipelineDropdownInput]: {
    currentNodeId: string;
    currentPipelineId: string;
    id: string;
    input: InputIndex;
  };
  [PipelineTypes.SetPipelineRequiredInput]: {
    currentNodeId: string;
    currentPipelineId: string;
    id: string;
    input: InputIndex;
  };
  [PipelineTypes.SetPipelineResources]: {
    pipelineId: number;
    parameters: any[];
    pluginPipings: PluginPiping[];
    pipelinePlugins: any[];
  };
  [PipelineTypes.SetPipelineEnvironments]: {
    pipelineId: number;
    computeEnvData: {
      [key: string]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    };
  };
  [PipelineTypes.SetCurrentNode]: {
    pipelineId: number;
    currentNode: number;
  };
  [PipelineTypes.SetExpandedPipelines]: {
    pipelineId: number;
  };

  [PipelineTypes.SetCurrentPipeline]: {
    pipelineId: number;
  };
  [PipelineTypes.SetPipelines]: {
    pipelines: any[];
  };

  [PipelineTypes.AddPipeline]: {
    pipeline: any;
  };

  [PipelineTypes.SetPipelineName]: {
    pipelineName: string;
  };

  [PipelineTypes.SetCurrentComputeEnvironment]: {
    computeEnv: {
      item: any;
      currentNode: number;
      currentPipelineId: string;
      computeEnvList: any[];
    };
  };
  [PipelineTypes.SetCurrentNodeTitle]: {
    currentPipelineId: string;
    currentNode: number;
    title: string;
  };

  [PipelineTypes.SetDefaultParameters]: {
    pipelineId: string;
    defaultParameters: [];
  };

  [PipelineTypes.DeselectPipeline]: Record<string, unknown>;

  [PipelineTypes.SetGeneralCompute]: {
    currentPipelineId: number;
    computeEnv: string;
  };
};

export type PipelineActions =
  ActionMap<PipelinePayload>[keyof ActionMap<PipelinePayload>];

export interface PipelineState {
  pipelineData: PipelineData;
  pipelineName: string;
  selectedPipeline?: number;
  pipelines: any[];
}

export interface PipelineData {
  [key: string]: {
    pluginParameters?: any[];
    defaultParameters?: any[];
    pluginPipings?: PluginPiping[];
    pipelinePlugins?: any[];
    computeEnvs?: ComputeEnvData;
    currentNode?: number;
    generalCompute?: string;
    title: {
      [id: number]: string;
    };
    input: {
      [id: string]: {
        dropdownInput: InputType;
        requiredInput: InputType;
      };
    };
  };
}
