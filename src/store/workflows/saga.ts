import { all, fork, takeEvery, put } from "@redux-saga/core/effects";
import {
  setupCovidnet,
  setupAdultFreesurfer,
  setupAdultFreesurferMoc,
  setupInfantFreesurfer,
  setupInfantFreesurferAge,
  setupFastsurfer,
  setupFetalReconstruction,
  setupFastsurferMoc,
} from "./setup";
import { WorkflowTypes, AnalysisStep } from "./types";
import { setAnalysisStep } from "./actions";
import { IActionTypeParam } from "../../api/models/base.model";

function* handleSubmitAnalysis(action: IActionTypeParam) {
  const { workflowType } = action.payload;

  if (workflowType === "covidnet") {
    yield setupCovidnet(action);
  }
  if (workflowType === "adultFreesurfer") {
    yield setupAdultFreesurfer(action);
  }
  if (workflowType === "infantFreesurfer") {
    yield setupInfantFreesurfer(action);
  }

  if (workflowType === "infantFreesurferAge") {
    yield setupInfantFreesurferAge(action);
  }

  if (workflowType === "fastsurfer") {
    yield setupFastsurfer(action);
  }
  if (workflowType === "fetalReconstruction") {
    yield setupFetalReconstruction(action);
  }
  if (workflowType === "adultFreesurfermoc") {
    yield setupAdultFreesurferMoc(action);
  }

  if (workflowType === "fastsurfermoc") {
    yield setupFastsurferMoc(action);
  }
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

function* watchSubmitAnalysis() {
  yield takeEvery(WorkflowTypes.SUBMIT_ANALYSIS, handleSubmitAnalysis);
}

export function* workflowsSaga() {
  yield all([fork(watchSubmitAnalysis)]);
}
