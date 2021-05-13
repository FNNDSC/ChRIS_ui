import keyMirror from "keymirror";

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
  description: string;
}

export interface IWorkflowState {
  pacsPayload: {
    files: PACSFile[];
    error: any;
    loading: boolean;
  };
  currentFile?: PACSFile;
  steps: AnalysisStep[];
  isAnalysisRunning: boolean;
}

export const WorkflowTypes = keyMirror({
  GET_PACS_FILES_REQUEST: null,
  GET_PACS_FILES_SUCCESS: null,
  GET_PACS_FILES_ERROR: null,
  SET_CURRENT_FILE: null,
  SUBMIT_ANALYSIS: null,
  SET_ANALYSIS_STEP: null,
});
