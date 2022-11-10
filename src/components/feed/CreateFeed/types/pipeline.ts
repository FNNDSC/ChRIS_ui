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
  SetPipelines = "SET_PIPELINES",
  SetPipelineResources = "SET_PIPELINE_RESOURCES",
  SetCurrentComputeEnvironment = "SET_CURRENT_COMPUTE_ENVIRONMENT",
  SetCurrentNode = "SET_CURRENT_NODE",
  AddPipeline = "ADD_PIPELINE",
  SetCurrentPipeline = "SET_CURRENT_PIPELINE",
  SetPipelineName = "SET_PIPELINE_NAME",
  SetPipelineEnvironments = "SET_PIPELINE_ENVIRONMENTS",
  SetCurrentNodeTitle = "SET_CURRENT_NODE_TITLE",
  DeletePipelineInput = "DELETE_PIPELINE_INPUT",
  SetPipelineDropdownInput = "SET_PIPELINE_DROPDOWN_INPUT",
  SetPipelineRequiredInput = "SET_PIPELINE_REQUIRED_INPUT",
  SetDefaultParameters = "SET_DEFAULT_PARAMETERS",
  SetGeneralCompute = "SET_GENERAL_COMPUTE",
  DeselectPipeline = "DESELECT_PIPELINE",
}

export interface ComputeEnvData {
  [key: string]: { computeEnvs: any[]; currentlySelected: any };
}

type PipelinePayload = {
  [PipelineTypes.SetPipelines]: {
    pipelines: any[];
  };

  [PipelineTypes.SetPipelineResources]: {
    pipelineId: number;
    parameters: any[];
    pluginPipings: PluginPiping[];
    pipelinePlugins: any[];
  };

  [PipelineTypes.SetCurrentComputeEnvironment]: {
    computeEnv: {
      item: any;
      currentNode: number;
      currentPipelineId: string;
      computeEnvList: any[];
    };
  };

  [PipelineTypes.SetCurrentNode]: {
    pipelineId: number;
    currentNode: number;
  };

  [PipelineTypes.AddPipeline]: {
    pipeline: any;
  };

  [PipelineTypes.SetCurrentPipeline]: {
    pipelineId: number;
  };

  [PipelineTypes.SetPipelineName]: {
    pipelineName: string;
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

  [PipelineTypes.SetCurrentNodeTitle]: {
    currentPipelineId: string;
    currentNode: number;
    title: string;
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

export interface SinglePipeline {
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
}

export interface PipelineData {
  [key: string]: SinglePipeline;
}
