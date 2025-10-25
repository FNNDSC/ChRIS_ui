import type { Datetime } from "./datetime";
import type { ID } from "./id";

export interface PACSSeries {
  id: ID;
  creation_date: Datetime; // yyyy-mm-ddTHH:MM:SS.ffffffTZ
  folder_path: string;
  PatientID: string;
  PatientName: string;
  PatientBirthDate: string;
  PatientAge: string;
  PatientSex: string;
  StudyDate: string;
  AccessionNumber: string;
  Modality: string;
  ProtocolName: string;
  StudyInstanceUID: string;
  StudyDescription: string;
  SeriesInstanceUID: string;
  SeriesDescription: string;
  pacs_identifier: string;
}

export interface PFDCMSeries {
  AccessionNumber: string;
  AcquisitionProtocolDescription: string;
  AcquisitionProtocolName: string;
  InstanceNumber: string;
  ModalitiesInStudy: string;
  Modality: string;
  NumberOfSeriesRelatedInstances: string;
  PatientAge: string;
  PatientBirthDate: string;
  PatientID: string;
  PatientName: string;
  PatientSex: string;
  PerformedStationAETitle: string;
  ProtocolName: string;
  SeriesDate: string;
  SeriesDescription: string;
  SeriesInstanceUID: string;
  StudyDate: string;
  StudyDescription: string;
  StudyInstanceUID: string;
  dblogbasepath: string;
  json_response: boolean;
  then: string;
  thenArgs: string;
  withFeedBack: boolean;
}

export interface PYPXArgs {
  AccessionNumber: string;
  AcquisitionProtocolDescription: string;

  AcquisitionProtocolName: string;
  InstanceNumber: string;
  ModalitiesInStudy: string;
  Modality: string;
  NumberOfSeriesRelatedInstances: string;
  PatientAge: string;
  PatientBirthDate: string;
  PatientID: string;
  PatientName: string;
  PatientSex: string;
  PerformedStationAETitle: string;
  ProtocolName: string;
  QueryRetrieveLevel: string;
  SeriesDate: string;
  SeriesDescription: string;
  SeriesInstanceUID: string;
  StudyDate: string;
  StudyDescription: string;
  StudyInstanceUID: string;
  aec: string;
  aet: string;
  aet_listener: string;
  dblogbasepath: string;
  json: boolean;
  json_response: boolean;
  serverIP: string;
  serverPort: string;
  then: string;
  thenArgs: string;
  withFeedBack: boolean;
}

export interface PYPXCoreData {
  tag: number | string;
  value: number | string;
  label: string;
}

export interface PYPXSeriesData {
  [key: string]: PYPXCoreData;
}

export interface PYPXData extends PYPXSeriesData {
  // @ts-expect-error
  series: PYPXSeriesData[];
}

export interface PYPXResult {
  args: PYPXArgs;
  command: string;
  data: PYPXData[];
  status: string;
}

export interface PFDCMResult {
  PACSDirective: PFDCMSeries;
  message: string;
  pypx: PYPXResult;
  status: string;
}
