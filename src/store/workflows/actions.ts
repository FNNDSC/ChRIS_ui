import { action } from "typesafe-actions";
import { PACSFile, WorkflowTypes, AnalysisStep } from "./types";

export const getPacsFilesRequest = () =>
  action(WorkflowTypes.GET_PACS_FILES_REQUEST);

export const getPacsFilesSuccess = (files: PACSFile[]) =>
  action(WorkflowTypes.GET_PACS_FILES_SUCCESS, files);

export const setCurrentPacsFile = (file: PACSFile) =>
  action(WorkflowTypes.SET_CURRENT_FILE, file);

export const submitAnalysis = (file: PACSFile) =>
  action(WorkflowTypes.SUBMIT_ANALYSIS, file);

export const setAnalysisStep = (step: AnalysisStep) =>
  action(WorkflowTypes.SET_ANALYSIS_STEP, step);
