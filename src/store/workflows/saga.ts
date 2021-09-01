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
  if (workflowType === "adult-freesurfer") {
    yield setupAdultFreesurfer(action);
  }
  if (workflowType === "infant-freesurfer") {
    yield setupInfantFreesurfer(action);
  }

  if (workflowType === "infant-freesurfer-age") {
    yield setupInfantFreesurferAge(action);
  }

  if (workflowType === "fastsurfer") {
    yield setupFastsurfer(action);
  }
  if (workflowType === "fetal-reconstruction") {
    yield setupFetalReconstruction(action);
  }
  if (workflowType === "adult-freesurfer:moc") {
    yield setupAdultFreesurferMoc(action);
  }

  if (workflowType === "fastsurfer:moc") {
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
