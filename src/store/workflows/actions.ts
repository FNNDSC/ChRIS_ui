import { action } from "typesafe-actions";
import {
  PACSFile,
  WorkflowTypes,
  AnalysisStep,
  PacsSuccessPayload,
} from "./types";

export const getPacsFilesRequest = (name?: string, limit?: number, offset?: number) =>
  action(WorkflowTypes.GET_PACS_FILES_REQUEST, { name, limit, offset });

export const getPacsFilesSuccess = (files: PacsSuccessPayload) =>
  action(WorkflowTypes.GET_PACS_FILES_SUCCESS, files);

export const setCurrentPacsFile = (file: PACSFile) =>
  action(WorkflowTypes.SET_CURRENT_FILE, file);


export const setLocalFile = (file: File) =>
  action(WorkflowTypes.SET_LOCAL_FILE, file);

export const submitAnalysis = (file: PACSFile) =>
  action(WorkflowTypes.SUBMIT_ANALYSIS, file);

export const setAnalysisStep = (step: AnalysisStep) =>
  action(WorkflowTypes.SET_ANALYSIS_STEP, step);


export const resetWorkflowState = () =>
  action(WorkflowTypes.RESET_WORKFLOW_STEP);