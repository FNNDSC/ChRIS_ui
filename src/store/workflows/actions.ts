import { action } from "typesafe-actions";
import {
  WorkflowTypes,
  AnalysisStep,
  AnalysisPayload,
  SelectWorkflowState,
} from "./types";
import { LocalFile } from "../../components/feed/CreateFeed/types";

export const getPacsFilesRequest = (
  name?: string,
  limit?: number,
  offset?: number
) => action(WorkflowTypes.GET_PACS_FILES_REQUEST, { name, limit, offset });

export const setLocalFile = (files: LocalFile[]) =>
  action(WorkflowTypes.SET_LOCAL_FILE, files);

export const setOptionState = (optionState: SelectWorkflowState) =>
  action(WorkflowTypes.SET_OPTION_STATE, optionState);

export const submitAnalysis = (analysisPayload: AnalysisPayload) =>
  action(WorkflowTypes.SUBMIT_ANALYSIS, analysisPayload);

export const setAnalysisStep = (step: AnalysisStep) =>
  action(WorkflowTypes.SET_ANALYSIS_STEP, step);

export const setInfantAge = (value: string) =>
  action(WorkflowTypes.SET_INFANT_AGE, value);

export const resetWorkflowState = () =>
  action(WorkflowTypes.RESET_WORKFLOW_STEP);

export const stopFetchingPluginResources = () =>
  action(WorkflowTypes.STOP_FETCHING_PLUGIN_RESOURCES);

export const setPluginFiles = (files: any[]) =>
  action(WorkflowTypes.SET_PLUGIN_FILES, files);

export const deleteLocalFile = (fileName: string) =>
  action(WorkflowTypes.DELETE_LOCAL_FILE, fileName);

export const setFeedDetails = (id: number) =>
  action(WorkflowTypes.SET_FEED_DETAILS, id);

export const stopAnalysis = () => action(WorkflowTypes.STOP_ANALYSIS);
