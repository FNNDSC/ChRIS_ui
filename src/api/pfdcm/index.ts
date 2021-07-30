import { parseRawDcmData } from "./pfdcm-utils";
import axios, { AxiosRequestConfig } from "axios";
// import mockData from "./mock_data";

type PatientSex = 'M' | 'F' | 'O';
type QueryRetrieveLevel = 'STUDY' | 'SERIES' | 'IMG';

export interface PACSStudy {
  accessionNumber: string;
  instanceNumber: string;
  modalitiesInStudy: string;
  modality: string;
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
  modality: string;
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

export interface PACSPatient {
  patientID: string;
  patientName: string;
  patientSex: PatientSex;
  patientBirthDate: Date;
  studies: PACSStudy[];
}

export interface PFDCMFilters {
  accessionNumber?: string;
  instanceNumber?: string;
  modality?: string;
  patientBirthDate?: Date;
  patientID?: string;
  patientName?: string;
  patientSex?: PatientSex;
  retrieveAETitle?: string;
  seriesDescription?: string;
  seriesInstanceUID?: string;
  studyDate?: Date;
  studyInstanceUID?: string;
  uid?: number;
}

/**
 * Client API to interact with `pfdcm`
 */
class PFDCMClient {
  readonly url: string;

  constructor() {
    this.url = process.env.REACT_APP_PFDCM_URL || String();
  }

  /**
   * Send request to the `/pypx` endpoint, used for query and retrieve
   * @param query Query Object
   * @param filters Filters on the Query Obeject
   * @returns PACS Patient array
   */
  private async query(query: any, filters: PFDCMFilters = {}) {
    // Apply filters
    query = { ...query, ...filters };

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: {
        accept: "application/json",
        contentType: "application/json"
      },
      data: {
        PACSservice: {
          "value": "orthanc"
        },
        listenerService: {
          "value": "default"
        },
        pypx_find: {
          ...query,
          withFeedBack: false,
          dblogbasepath: "/home/dicom/log",
          json_response: true
        }

      }
    }

    try {
      const raw = (await axios(RequestConfig)).data.pypx
      const studies = parseRawDcmData(raw);
      return this.sortStudiesByPatient(studies);
    } catch (error) {
      return []; 
    }
  }

  async queryByMrn(PatientId: string, filters: PFDCMFilters = {}) {
    return this.query({ PatientId }, filters);
  }

  async queryByPatientName(PatientName: string, filters: PFDCMFilters = {}) {
    return this.query({ PatientName }, filters);
  }

  async queryByStudyDate(StudyDate: Date, filters: PFDCMFilters = {}) {
    // date string format: yyyyMMddd (no spaces or dashes)
    const dateString = StudyDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '');

    return this.query({ StudyDate: dateString }, filters);
  }

  /**
   * Sort PACS Studies into PACS Patients.
   * @param studies PACS Study array to turn into patient array
   * @returns PACS Patient array
   */
  private sortStudiesByPatient(studies: PACSStudy[]): PACSPatient[] {
    const patientsStudies : { [id: string]: PACSStudy[] } = {}; // map of patient ID : studies
    const patients: { [id: string]: PACSPatient } = {}; // map of patient ID: patient data

    // sort studies by patient ID
    for (const study of studies) {
      const processedStudies = patientsStudies[study.patientID] || [];
      patientsStudies[study.patientID] = [ ...processedStudies, study ];
      
      if (!patients[study.patientID]) {
        patients[study.patientID] = {
          patientID: study.patientID,
          patientName: study.patientName,
          patientSex: study.patientSex,
          patientBirthDate: study.patientBirthDate,
          studies: []
        }
      }
    }

    // combine sorted studies and patient data
    for (const patientId of Object.keys(patientsStudies)) {
      patients[patientId] = {
        ...patients[patientId],
        studies: patientsStudies[patientId]
      }
    }

    return Object.values(patients);
  }
}

export default PFDCMClient;
