import React, { useContext } from "react";
import { Pipeline } from "@fnndsc/chrisapi";
import Pipelines from "./Pipelines";
import { PipelineContext } from "./context";
import { PipelineTypes, Resources, UploadJsonProps } from "./types/pipeline";
import { InputIndex } from "../AddNode/types";

const PipelineContainer = ({ justDisplay }: { justDisplay?: boolean }) => {
  const { state, dispatch } = useContext(PipelineContext);

  const handleDispatchPipelines = React.useCallback(
    (registeredPipelines: any) => {
      dispatch({
        type: PipelineTypes.SetPipelines,
        payload: {
          pipelines: registeredPipelines,
        },
      });
    },
    [dispatch]
  );

  const handleSetPipelineResources = React.useCallback(
    (result: Resources) => {
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
    },
    [dispatch]
  );

  const handleSetCurrentComputeEnv = React.useCallback(
    (
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
    },
    [dispatch]
  );

  const handleSetCurrentNode = React.useCallback(
    (pipelineId: number, currentNode: number) => {
      dispatch({
        type: PipelineTypes.SetCurrentNode,
        payload: {
          pipelineId,
          currentNode,
        },
      });
    },
    [dispatch]
  );

  const handleUploadDispatch = React.useCallback(
    (result: UploadJsonProps) => {
      const { pipelineInstance } = result;
      dispatch({
        type: PipelineTypes.AddPipeline,
        payload: {
          pipeline: pipelineInstance,
        },
      });
      handleSetPipelineResources(result);
    },
    [dispatch, handleSetPipelineResources]
  );

  const handleCleanResources = React.useCallback(() => {
    dispatch({
      type: PipelineTypes.DeselectPipeline,
      payload: {},
    });
  }, [dispatch]);

  const handlePipelineSecondaryResource = React.useCallback(
    (pipeline: Pipeline) => {
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
    },
    [dispatch]
  );

  const handleSetPipelineEnvironments = React.useCallback(
    (
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
    },
    [dispatch]
  );

  const handleSetCurrentNodeTitle = React.useCallback(
    (currentPipelineId: number, currentNode: number, title: string) => {
      dispatch({
        type: PipelineTypes.SetCurrentNodeTitle,
        payload: {
          currentPipelineId,
          currentNode,
          title,
        },
      });
    },
    [dispatch]
  );

  const handleSetGenerateCompute = React.useCallback(
    (currentPipelineId: number, computeEnv: string) => {
      dispatch({
        type: PipelineTypes.SetGeneralCompute,
        payload: {
          currentPipelineId,
          computeEnv,
        },
      });
    },
    [dispatch]
  );

  const handleTypedInput = React.useCallback(
    (
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
    },
    [dispatch]
  );

  const handleDeleteInput = React.useCallback(
    (currentPipelineId: number, currentNode: number, index: string) => {
      dispatch({
        type: PipelineTypes.DeletePipelineInput,
        payload: {
          currentPipelineId,
          currentNodeId: currentNode,
          input: index,
        },
      });
    },
    [dispatch]
  );

  return (
    <div className="pacs-alert-wrap">
      <div className="pacs-alert-step-wrap">
        <h1 className="pf-c-title pf-m-2xl"> Registered Pipelines</h1>
        <Pipelines
          justDisplay={justDisplay}
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
