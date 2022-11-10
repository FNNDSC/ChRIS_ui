import React, { useContext } from "react";
import { Pipeline, PipelinePipingDefaultParameterList } from "@fnndsc/chrisapi";
import Pipelines from "./Pipelines";
import { CreateFeedContext, PipelineContext } from "./context";
import { PipelineTypes } from "./types/pipeline";
import { InputIndex } from "../AddNode/types";

export type UploadJsonProps = Resources & PipelineInstanceResource;

export interface Resources {
  parameters: PipelinePipingDefaultParameterList;
  pluginPipings: any[];
  pipelinePlugins: any[];
  pipelineId?: number;
}

export interface PipelineInstanceResource {
  pipelineInstance: Pipeline;
}

const PipelineContainer = () => {
  const { state, dispatch } = useContext(PipelineContext);

  const handleDispatchPipelines = (registeredPipelines: any) => {
    dispatch({
      type: PipelineTypes.SetPipelines,
      payload: {
        pipelines: registeredPipelines,
      },
    });
  };

  const handleSetPipelineResources = React.useCallback((result: Resources) => {
    const { parameters, pluginPipings, pipelinePlugins, pipelineId } = result;
    dispatch({
      type: PipelineTypes.SetPipelineResources,
      payload: {
        pipelineId,
        parameters,
        pluginPipings,
        pipelinePlugins,
      },
    });
  }, [dispatch]);

  const handleSetCurrentComputeEnv = (
    item: {
      name: string;
      description: string;
    },
    currentNode: number,
    currentPipelineId: number,
    computeEnvList: any[]
  ) => {
    dispatch({
      type: PipelineTypes.SetCurrentComputeEnvironment,
      payload: {
        computeEnv: {
          item,
          currentNode,
          currentPipelineId,
          computeEnvList,
        },
      },
    });
  };

  const handleSetCurrentNode = (pipelineId: number, currentNode: number) => {
    dispatch({
      type: PipelineTypes.SetCurrentNode,
      payload: {
        pipelineId,
        currentNode,
      },
    });
  };

  const handleUploadDispatch = (result: UploadJsonProps) => {
    const { pipelineInstance } = result;
    dispatch({
      type: PipelineTypes.AddPipeline,
      payload: {
        pipeline: pipelineInstance,
      },
    });
    handleSetPipelineResources(result);
  };

  const handleCleanResources = () => {
    dispatch({
      type: PipelineTypes.DeselectPipeline,
      payload: {},
    });
  };

  const handlePipelineSecondaryResource = (pipeline: Pipeline) => {
    dispatch({
      type: PipelineTypes.SetCurrentPipeline,
      payload: {
        pipelineId: pipeline.data.id,
      },
    });

    dispatch({
      type: PipelineTypes.SetPipelineName,
      payload: {
        pipelineName: pipeline.data.name,
      },
    });
  };

  const handleSetPipelineEnvironments = (
    pipelineId: number,
    computeEnvData: {
      [x: number]: {
        computeEnvs: any[];
        currentlySelected: any;
      };
    }
  ) => {
    dispatch({
      type: PipelineTypes.SetPipelineEnvironments,
      payload: {
        pipelineId,
        computeEnvData,
      },
    });
  };

  const handleSetCurrentNodeTitle = (
    currentPipelineId: number,
    currentNode: number,
    title: string
  ) => {
    dispatch({
      type: PipelineTypes.SetCurrentNodeTitle,
      payload: {
        currentPipelineId,
        currentNode,
        title,
      },
    });
  };

  const handleSetGenerateCompute = (
    currentPipelineId: number,
    computeEnv: string
  ) => {
    dispatch({
      type: PipelineTypes.SetGeneralCompute,
      payload: {
        currentPipelineId,
        computeEnv,
      },
    });
  };

  const handleTypedInput = (
    currentPipelineId: number,
    currentNodeId: number,
    id: string,
    input: InputIndex,
    required: boolean
  ) => {
    if (required === true) {
      dispatch({
        type: PipelineTypes.SetPipelineRequiredInput,
        payload: {
          currentPipelineId,
          currentNodeId,
          id,
          input,
        },
      });
    } else {
      dispatch({
        type: PipelineTypes.SetPipelineDropdownInput,
        payload: {
          currentPipelineId,
          currentNodeId,
          id,
          input,
        },
      });
    }
  };

  const handleDeleteInput = (
    currentPipelineId: number,
    currentNode: number,
    index: string
  ) => {
    dispatch({
      type: PipelineTypes.DeletePipelineInput,
      payload: {
        currentPipelineId,
        currentNodeId: currentNode,
        input: index,
      },
    });
  };

  return (
    <div className="pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl"> Registered Pipelines</h1>
        <Pipelines
          state={{
            pipelineData: state.pipelineData,
            selectedPipeline: state.selectedPipeline,
            pipelines: state.pipelines,
          }}
          handleDispatchPipelines={handleDispatchPipelines}
          handleUploadDispatch={handleUploadDispatch}
          handleSetPipelineResources={handleSetPipelineResources}
          handleSetCurrentNode={handleSetCurrentNode}
          handleCleanResources={handleCleanResources}
          handlePipelineSecondaryResource={handlePipelineSecondaryResource}
          handleSetCurrentNodeTitle={handleSetCurrentNodeTitle}
          handleSetPipelineEnvironments={handleSetPipelineEnvironments}
          handleSetGeneralCompute={handleSetGenerateCompute}
          handleTypedInput={handleTypedInput}
          handleDeleteInput={handleDeleteInput}
          handleSetCurrentComputeEnv={handleSetCurrentComputeEnv}
        />
      </div>
    </div>
  );
};

export default PipelineContainer;
