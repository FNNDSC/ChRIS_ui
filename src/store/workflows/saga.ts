import { all, fork, takeEvery, put } from "@redux-saga/core/effects";
import {
  Pipeline,
  PipelineList,
  PipelinePipingDefaultParameterList,
} from "@fnndsc/chrisapi";

import { WorkflowTypes, AnalysisStep } from "./types";
import {
  setAnalysisStep,
  setPipelinePluginsSuccess,
  setPluginParametersSuccess,
  setPluginPipingsSuccess,
  setUploadedSpecSuccess,
} from "./actions";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../utils";
import { createFeed, createFeedTree } from "./setup";

function* handleSubmitAnalysis(action: IActionTypeParam) {
  const { pipelinePlugins, pluginParameters, pluginPipings, computeEnvs } =
    action.payload;
  const { dircopyInstance } = yield createFeed(action.payload);
  yield createFeedTree(
    dircopyInstance,
    pluginPipings,
    pipelinePlugins,
    pluginParameters,
    computeEnvs
  );
  yield setYieldAnalysis(3, "Success", "finish", "");
}

export function* setYieldAnalysis(
  id: AnalysisStep["id"],
  title: AnalysisStep["title"],
  status: AnalysisStep["status"],
  error: AnalysisStep["error"]
) {
  yield put(
    setAnalysisStep({
      id,
      title,
      status,
      error,
    })
  );
}

function* handleGeneratePipeline(action: IActionTypeParam) {
  yield createPipeline(action.payload);
}

function* handleUploadedSpec(action: IActionTypeParam) {
  const uploadedPipeline = action.payload;
  uploadedPipeline["plugin_tree"] = JSON.stringify(
    uploadedPipeline["plugin_tree"]
  );

  yield put(setUploadedSpecSuccess(uploadedPipeline.name));
  yield createPipeline(uploadedPipeline);
}

function* handleSetCurrentPipeline(action: IActionTypeParam) {
  const { pipeline } = action.payload;
  yield createPipeline({
    name: pipeline,
  });
}

function* watchSubmitAnalysis() {
  yield takeEvery(WorkflowTypes.SUBMIT_ANALYSIS, handleSubmitAnalysis);
}

function* watchGeneratePipeline() {
  yield takeEvery(WorkflowTypes.GENERATE_PIPELINE, handleGeneratePipeline);
}

function* watchSetUploadedSpec() {
  yield takeEvery(WorkflowTypes.SET_UPLOADED_SPEC, handleUploadedSpec);
}

function* watchSetCurrentPipeline() {
  yield takeEvery(WorkflowTypes.SET_CURRENT_PIPELINE, handleSetCurrentPipeline);
}

export function* workflowsSaga() {
  yield all([
    fork(watchSubmitAnalysis),
    fork(watchGeneratePipeline),
    fork(watchSetUploadedSpec),
    fork(watchSetCurrentPipeline),
  ]);
}

function* createPipeline(data: any) {
  const client = ChrisAPIClient.getClient();

  const pipelineName = data.name;

  const pipelineInstanceList: PipelineList = yield client.getPipelines({
    name: pipelineName,
  });
  if (pipelineInstanceList.data) {
    const pipelineInstanceId = pipelineInstanceList.data[0].id;
    const pipelineInstance: Pipeline = yield client.getPipeline(
      pipelineInstanceId
    );
    yield fetchResources(pipelineInstance);
  } else {
    const pipelineInstance: Pipeline = yield client.createPipeline(data);
    yield fetchResources(pipelineInstance);
  }
}

function* fetchResources(pipelineInstance: Pipeline) {
  const params = {
    limit: 20,
    offset: 0,
  };

  const pipelinePluginsFn = pipelineInstance.getPlugins;
  const pipelineFn = pipelineInstance.getPluginPipings;
  const parameterFn = pipelineInstance.getDefaultParameters;
  const boundPipelinePluginFn = pipelinePluginsFn.bind(pipelineInstance);
  const boundPipelineFn = pipelineFn.bind(pipelineInstance);
  const boundParameterFn = parameterFn.bind(pipelineInstance);
  const pluginPipings: any[] = yield fetchResource(params, boundPipelineFn);
  const pipelinePlugins: any[] = yield fetchResource(
    params,
    boundPipelinePluginFn
  );
  const parameters: PipelinePipingDefaultParameterList = yield fetchResource(
    params,
    boundParameterFn
  );

  yield put(setPluginParametersSuccess(parameters));
  if (pluginPipings) {
    yield put(setPluginPipingsSuccess(pluginPipings));
  }
  yield put(setPipelinePluginsSuccess(pipelinePlugins));
}
