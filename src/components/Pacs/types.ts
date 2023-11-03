export enum PFDCMQueryTypes {
  pmrn,
  name,
  accession_number,
}

export type PatientSex = "M" | "F" | "O";
type QueryRetrieveLevel = "STUDY" | "SERIES" | "IMG";

export interface PFDCMFilters {
  AccessionNumber?: string;
  Modality?: string;
  PatientBirthDate?: Date;
  PatientID?: string;
  PatientName?: string;
  PatientSex?: PatientSex;
  RetrieveAETitle?: string;
  SeriesInstanceUID?: string;
  StudyDate?: string;
  StudyInstanceUID?: string;
}

export interface PFDCMQuery {
  value: string;
  type: PFDCMQueryTypes;
  filters: PFDCMFilters;
}

export interface PACSStudy {
  AccessionNumber: string;
  InstanceNumber: string;
  ModalitiesInStudy: string;
  Modality: string;
  NumberOfStudyRelatedInstances: number;
  NumberOfStudyRelatedSeries: number;
  PatientBirthDate: Date;
  PatientID: string;
  PatientName: string;
  PatientSex: PatientSex;
  PerformedStationAETitle: string;
  QueryRetrieveLevel: QueryRetrieveLevel;
  RetrieveAETitle: string;
  StudyDate: Date;
  StudyDescription: string;
  StudyInstanceUID: string;
  SeriesInstanceUID: string;
  series: PACSSeries[];
  uid: number;
}

export interface PACSSeries {
  AccessionNumber: string;
  InstanceNumber: string;
  ModalitiesInStudy: string;
  Modality: string;
  NumberOfSeriesRelatedInstances: number;
  NumberOfStudyRelatedInstances: number;
  NumberOfStudyRelatedSeries: number;
  PatientBirthDate: Date;
  PatientID: string;
  PatientName: string;
  PatientSex: PatientSex;
  QueryRetrieveLevel: QueryRetrieveLevel;
  RetrieveAETitle: string;
  SeriesDescription: string;
  SeriesInstanceUID: string;
  StudyDate: Date;
  SeriesDate: Date;
  StudyInstanceUID: string;
  command: string;
  label: string;
  status: string;
  uid: number;
}

export interface PACSPatient {
  PatientID: string;
  PatientName: string;
  PatientSex: PatientSex;
  PatientBirthDate: Date;
  studies: PACSStudy[];
}

export interface RawDcmData {
  status: string;
  command: string;
  data: RawDcmObject[];
  args: {
    [argument: string]: string | number | boolean;
  };
}

export interface RawDcmObject {
  [label: string]: RawDcmItem | RawDcmObject[];
}

export interface RawDcmItem {
  tag: number | string;
  value: number | string;
  label: string;
}

export enum PACSPullStages {
  NONE,
  RETRIEVE,
  PUSH,
  REGISTER,
  COMPLETED,
}