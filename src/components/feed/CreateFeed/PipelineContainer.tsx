import React, { useContext } from "react";
import { Pipeline, PipelinePipingDefaultParameterList } from "@fnndsc/chrisapi";
import Pipelines from "./Pipelines";
import { CreateFeedContext } from "./context";
import { PipelineTypes } from "./types/pipeline";

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
  const { state, dispatch } = useContext(CreateFeedContext);
  console.log("State", state);

  const handleDispatchPipelines = (registeredPipelines: any) => {
    dispatch({
      type: PipelineTypes.SetPipelines,
      payload: {
        pipelines: registeredPipelines,
      },
    });
  };

  const handleSetPipelineResources = (result: Resources) => {
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

  return (
    <div className="pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl"> Registered Pipelines</h1>
        <Pipelines
          state={{
            pipelineData: state.pipelineState.pipelineData,
            selectedPipeline: state.pipelineState.selectedPipeline,
            pipelines: state.pipelineState.pipelines,
          }}
          handleDispatchPipelines={handleDispatchPipelines}
          handleUploadDispatch={handleUploadDispatch}
          handleSetPipelineResources={handleSetPipelineResources}
          handleSetCurrentNode={handleSetCurrentNode}
          handleCleanResources={handleCleanResources}
          handlePipelineSecondaryResource={handlePipelineSecondaryResource}
        />
      </div>
    </div>
  );
};

export default PipelineContainer;
