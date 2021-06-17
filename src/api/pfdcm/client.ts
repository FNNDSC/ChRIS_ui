import { parseRawDcmData } from "./pfdcm-utils";
import mockData from "./mock_data";

export interface PACSStudy {
  accessionNumber: string;
  instanceNumber: string;
  modalitiesInStudy: string;
  modality: string;
  numberOfStudyRelatedInstances: string;
  numberOfStudyRelatedSeries: string;
  patientBirthDate: string;
  patientID: string;
  patientName: string;
  patientSex: string;
  performedStationAETitle: string;
  queryRetrieveLevel: string;
  retrieveAETitle: string;
  series: PACSSeries[];
  seriesInstanceUID: string;
  studyDate: string;
  studyDescription: string;
  studyInstanceUID: string;
  uid: number;
}

export interface PACSSeries {
  accessionNumber: string;
  instanceNumber: string;
  modalitiesInStudy: string;
  modality: string;
  numberOfSeriesRelatedInstances: string;
  numberOfStudyRelatedInstances: string;
  numberOfStudyRelatedSeries: string;
  patientBirthDate: string;
  patientID: string;
  patientName: string;
  patientSex: string;
  queryRetrieveLevel: string;
  retrieveAETitle: string;
  seriesDescription: string;
  seriesInstanceUID: string;
  studyDate: string;
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
