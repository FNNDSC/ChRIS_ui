import keyMirror from "keymirror";
import { LocalFile } from "../../components/feed/CreateFeed/types";
import {
  IPluginCreateData,
  Plugin,
  PluginInstance,
  Feed,
} from "@fnndsc/chrisapi";

export interface PACSData {
  id: number;
  creation_date: string;
  fname: string;
  PatientID: string;
  PatientName: string;
  PatientBirthDate: string;
  PatientAge: number;
  PatientSex: string;
  StudyInstanceUID: string;
  StudyDescription: string;
  SeriesInstanceUID: string;
  SeriesDescription: string;
  StudyDate: string;
  Modality: string;
  pacs_identifier: string;
  ProtocolName: string;
}

export interface PACSFile {
  url: string;
  auth: {
    token: string;
  };
  contentType: string;
  collection: Record<string, unknown>;
  data: PACSData;
}

export interface AnalysisStep {
  id: number;
  title: string;
  status: "wait" | "process" | "finish" | "error";
  error: any;
}

export interface AnalysisPayload {
  pacsFile: PACSFile[];
  localFiles: LocalFile[];
  workflowType: string;
  username: string;
}

export interface SelectWorkflowState {
  isOpen: boolean;
  toggleTemplateText: string;
  selectedOption: string;
}

export interface IWorkflowState {
  pacsPayload: {
    files: PACSFile[];
    error: any;
    loading: boolean;
  };
  localfilePayload: {
    files: LocalFile[];
    error: any;
    loading: boolean;
  };
  currentPacsFile: PACSFile[];
  steps: AnalysisStep[];
  isAnalysisRunning: boolean;
  totalFileCount: number;
  optionState: SelectWorkflowState;
  checkFeedDetails: number | undefined;
}

export interface PacsSuccessPayload {
  files: PACSFile[];
  totalFileCount: number;
}

export interface DircopyData extends IPluginCreateData {
  dir: string;
}

export interface Med2ImgData extends IPluginCreateData {
  inputFile: any;
  sliceToConvert: number | string;
  outputFileStem?: string;
}

export interface CovidnetData extends IPluginCreateData {
  imagefile: any;
}

export interface IFSHackData extends IPluginCreateData {
  inputFile?: string;
  outputFile: string;
  exec: string;
  args: string;
}

export enum PollStatus {
  CREATED = "created",
  WAITING = "waiting",
  SCHEDULED = "scheduled",
  STARTED = "started",
  REGISTERING_FILES = "registeringFiles",
  SUCCESS = "finishedSuccessfully",
  ERROR = "finishedWithError",
  CANCELLED = "cancelled",
}

export type Result = {
  plugin: PluginInstance;
  status: string;
};

export type PluginList = {
  [key: string]: Plugin;
};

export type RegistrationCheck = {
  checkPassed: boolean;
  plugins: PluginList;
};

export type FeedReturnPayload = {
  feed?: Feed;
  error?: "";
  instance?: PluginInstance;
};

export const WorkflowTypes = keyMirror({
  GET_PACS_FILES_REQUEST: null,
  GET_PACS_FILES_SUCCESS: null,
  GET_PACS_FILES_ERROR: null,
  SET_CURRENT_FILE: null,
  SET_PLUGIN_FILES: null,
  SET_LOCAL_FILE: null,
  SUBMIT_ANALYSIS: null,
  SET_ANALYSIS_STEP: null,
  SET_OPTION_STATE: null,
  RESET_WORKFLOW_STEP: null,
  STOP_FETCHING_PLUGIN_RESOURCES: null,
  SET_FEED_DETAILS: null,
});
