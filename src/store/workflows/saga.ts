import { all, fork, takeEvery, put } from "@redux-saga/core/effects";
import {
  setupCovidnet,
  setupAdultFreesurfer,
  setupInfantFreesurfer,
} from "./setup";
import { WorkflowTypes, PACSFile, AnalysisStep } from "./types";
import { getPacsFilesSuccess, setAnalysisStep } from "./actions";
import { IActionTypeParam } from "../../api/models/base.model";
import ChrisAPIClient from "../../api/chrisapiclient";

function* handleGetPacsFilesRequest(action: IActionTypeParam) {
  const client = ChrisAPIClient.getClient();
  const { name, limit, offset } = action.payload;

  try {
    //@ts-ignore
    const fileList = yield client.getPACSFiles({
      PatientID: name,
      limit,
      offset,
    });
    const files: PACSFile[] = fileList.getItems();
    const totalFileCount = fileList.totalCount;

    yield put(
      getPacsFilesSuccess({
        files,
        totalFileCount,
      })
    );
  } catch (error) {
    console.error(error);
  }
}

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
}

function* watchGetPacsFilesRequest() {
  yield takeEvery(
    WorkflowTypes.GET_PACS_FILES_REQUEST,
    handleGetPacsFilesRequest
  );
}

function* watchSubmitAnalysis() {
  yield takeEvery(WorkflowTypes.SUBMIT_ANALYSIS, handleSubmitAnalysis);
}

export function* workflowsSaga() {
  yield all([fork(watchGetPacsFilesRequest)]);
  yield all([fork(watchSubmitAnalysis)]);
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
