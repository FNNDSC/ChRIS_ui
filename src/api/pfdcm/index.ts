import { parseRawDcmData } from "./pfdcm-utils";
import mockData from "./mock_data";

type Modality = 'AR' | 'AU' | 'BDUS' | 'BI' | 'BMD' | 'CR' | 'CT' | 'DG' | 'DOC' | 'DX' | 'ECG' | 'EPS' | 'ES' | 'FID' | 'GM' | 'HC' | 'HD' | 'IO' | 'IOL' | 'IVOCT' | 'IVUS' | 'KER' | 'KO' | 'LEN' | 'LS' | 'MG' | 'MR' | 'NM' | 'OAM' | 'OCT' | 'OP' | 'OPM' | 'OPT' | 'OPV' | 'OT' | 'PLAN' | 'PR' | 'PT' | 'PX' | 'REG' | 'RESP' | 'RF' | 'RG' | 'RTDOSE' | 'RTIMAGE' | 'RTPLAN' | 'RTRECORD' | 'RTSTRUCT' | 'SEG' | 'SM' | 'SMR' | 'SR' | 'SRF' | 'TG' | 'US' | 'VA' | 'XA' | 'XC';
type PatientSex = 'M' | 'F' | 'O';
type QueryRetrieveLevel = 'STUDY' | 'SERIES' | 'IMG';

export interface PACSStudy {
  accessionNumber: string;
  instanceNumber: string;
  modalitiesInStudy: string;
  modality: Modality;
  numberOfStudyRelatedInstances: number;
  numberOfStudyRelatedSeries: number;
  patientBirthDate: Date;
  patientID: string;
  patientName: string;
  patientSex: PatientSex;
  performedStationAETitle: string;
  queryRetrieveLevel: QueryRetrieveLevel;
  retrieveAETitle: string;
  series: PACSSeries[];
  seriesInstanceUID: string;
  studyDate: Date;
  studyDescription: string;
  studyInstanceUID: string;
  uid: number;
}

export interface PACSSeries {
  accessionNumber: string;
  instanceNumber: string;
  modalitiesInStudy: string;
  modality: Modality;
  numberOfSeriesRelatedInstances: number;
  numberOfStudyRelatedInstances: number;
  numberOfStudyRelatedSeries: number;
  patientBirthDate: Date;
  patientID: string;
  patientName: string;
  patientSex: PatientSex;
  queryRetrieveLevel: QueryRetrieveLevel;
  retrieveAETitle: string;
  seriesDescription: string;
  seriesInstanceUID: string;
  studyDate: Date;
  studyInstanceUID: string;
  command: string;
  label: string;
  status: string;
  uid: number;
}

interface PFDCMFilters {
  date: string;
}

class PFDCMClient {

  static async queryByMrn(mrn: string, filters: PFDCMFilters) {
    return parseRawDcmData(mockData);
  }

  static async queryByPatientName(name: string, filters: PFDCMFilters) {
    return parseRawDcmData(mockData);
  }

  static async queryByStudy(study: string, filters: PFDCMFilters) {
    return parseRawDcmData(mockData);
  }
  
}

export default PFDCMClient;
