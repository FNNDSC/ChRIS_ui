import { parseRawDcmData } from "./pfdcm-utils";
import mockData from "./mock_data";
import axios, { AxiosRequestConfig } from "axios";

declare const process: {
  env: {
    REACT_APP_PFDCM_URL: string;
  }
}

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

export interface PACSPatient {
  ID: string;
  name: string;
  sex: string;
  birthDate: Date;
  studies: PACSStudy[];
}

export interface PFDCMFilters {
  modality?: Modality;
  station?: string;
}

class PFDCMClient {

  private static sortStudiesByPatient(studies: PACSStudy[]): PACSPatient[] {
    const patientsStudiesMap : { [id: string]: PACSStudy[] } = {}; // map of patient ID : studies
    const patientsDataMap: { [id: string]: PACSPatient } = {}; // map of patient ID: patient data

    // sort studies by patient ID
    for (const study of studies) {
      const processedPatientStudies = patientsStudiesMap[study.patientID] || [];
      patientsStudiesMap[study.patientID] = [...processedPatientStudies, study];
      
      if (!patientsDataMap[study.patientID]) {
        patientsDataMap[study.patientID] = {
          ID: study.patientID,
          name: study.patientName,
          sex: study.patientSex,
          birthDate: study.patientBirthDate,
          studies: []
        }
      }
    }

    // combine sorted studies and patient data
    for (const patientId of Object.keys(patientsStudiesMap)) {
      patientsDataMap[patientId] = {
        ...patientsDataMap[patientId],
        studies: patientsStudiesMap[patientId]
      }
    }

    return Object.values(patientsDataMap);
  }

  // send request to the /pypx endpoint, used for query and retrieve
  private static sendPypxRequest(pypxFind: any) {
    const pfdcmUrl = process.env.REACT_APP_PFDCM_URL;
    const config: AxiosRequestConfig = {
      url: `${pfdcmUrl}api/v1/PACS/pypx/`,
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        PACSservice: {
          "value": "orthanc"
        },
        listenerService: {
          "value": "default"
        },
        pypx_find: {
          ...pypxFind,
          withFeedBack: false,
          dblogbasepath: "/home/dicom/log",
          json_response: true
        }

      }
    }
    return axios(config);
  }

  private static async queryPacs(query: any, filters: PFDCMFilters) {
    // apply filters
    if (filters.modality) {
      query.ModalitiesInStudy = filters.modality;
    }
    if (filters.station) {
      query.PerformedStationAETitle = filters.station;
    }

    const response = await this.sendPypxRequest({
      ...query,
      then: '',
    })
    const rawDcmData = response.data.pypx;
    
    const studies = parseRawDcmData(rawDcmData);
    return this.sortStudiesByPatient(studies);
  }

  static queryByMrn(mrn: string, filters: PFDCMFilters = {}): Promise<PACSPatient[]> {
    return this.queryPacs({ 
      PatientId: mrn 
    }, filters);
  }

  static queryByPatientName(name: string, filters: PFDCMFilters = {}): Promise<PACSPatient[]> {
    return this.queryPacs({
      PatientName: name,
    }, filters);
  }

  static async queryByStudyDate(date: Date, filters: PFDCMFilters = {}) {
    // date string format: yyyyMMddd (no spaces or dashes)
    const dateString = date
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '');

    return this.queryPacs({
      StudyDate: dateString
    }, filters);
  }
  }
  
}

export default PFDCMClient;
