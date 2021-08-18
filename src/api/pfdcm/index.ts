import { parseRawDcmData, sortStudiesByPatient } from "./pfdcm-utils";
import axios, { AxiosRequestConfig } from "axios";

interface PFDCMClientOptions {
  setDefaultPACS: boolean
}

const PFDCMDefaultOptions: PFDCMClientOptions = { 
  setDefaultPACS: true 
}

/**
 * Client API to interact with `pfdcm`
 */
class PFDCMClient {
  private readonly url: string;
  private readonly cube: string;
  private readonly swift: string;

  private PACSservice = {
    value: ""
  };

  private headers = {
    accept: "application/json",
    contentType: "application/json"
  };

  private PACSserviceList: string[] = [];
  private isLoadingPACSserviceList = false;

  constructor({ }: PFDCMClientOptions = PFDCMDefaultOptions) {
    if (!process.env.REACT_APP_PFDCM_URL)
      throw Error('PFDCM URL is undefined.');

    this.url = process.env.REACT_APP_PFDCM_URL as string
    this.cube = process.env.REACT_APP_PFDCM_CUBEKEY as string
    this.swift = process.env.REACT_APP_PFDCM_SWIFTKEY as string
  }

  /**
   * Get the registered PACS service to use for pfdcm
   */
  get service() {
    while (this.isLoadingPACSserviceList) {}
    return this.PACSservice.value
  }

  /**
   * Set a registered PACS service key to use for pfdcm
   */
  set service(key: string) {
    if (!this.PACSserviceList.includes(key))
      throw Error(`'${key}' is not a registered PACS service.`)

    this.PACSservice = {
      value: key
    }
  }

  /**
   * Get a list of registered PACS services from pfdcm
   * @returns PACSservice key list
   */
  async getPACSservices(): Promise<string[]> {
    try {
      const list = await axios.get(`${this.url}api/v1/PACSservice/list/`)
      this.PACSserviceList = list.data;
      return list.data;
    } catch (error) {
      console.error(error)
      return [];
    }
  }

  /**
   * Get properties of a registered PACS service from pfdcm
   * @returns PACSservice
   */
  async getServiceData(key: string) {
    try {
      const service = await axios.get(`${this.url}api/v1/PACSservice/${key}/`)
      return service.data;
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Send request to the `/pypx` endpoint, used for query and retrieve
   * @param query Query Object
   * @param filters Filters on the Query Obeject
   * @returns PACS Patient array
   */
  private async query(query: any, filters: PFDCMFilters = {}) {
    while (this.isLoadingPACSserviceList) {}
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first, before querying.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: {
          value: "default"
        },
        pypx_find: {
          ...query, ...filters
        }

      }
    }

    try {
      const raw = (await axios(RequestConfig)).data.pypx
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } catch (error) {
      console.error(error);
      return []; 
    }
  }

  private async retrieve(query: any = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: {
          value: "default"
        },
        pypx_find: {
          ...query,
          then: "retrieve"
        }
      }
    }

    try {
      return (await axios(RequestConfig)).data.pypx;
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  private async pushswift(query: any = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: {
          value: "default"
        },
        pypx_find: {
          ...query,
          then: "push",
          thenArgs: JSON.stringify({
            db: "/home/dicom/log", 
            swift: this.swift, 
            swiftServicesPACS: this.PACSservice.value,
            swiftPackEachDICOM: true
          })
        }

      }
    }

    try {
      return (await axios(RequestConfig)).data.pypx;
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  private async registercube(query: any = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: {
          value: "default"
        },
        pypx_find: {
          ...query,           
          then: "register",
          thenArgs: JSON.stringify({
            db: "/home/dicom/log", 
            CUBE: this.cube,
            swiftServicesPACS: this.PACSservice.value,
            parseAllFilesWithSubStr: "dcm"
          })
        }

      }
    }

    try {
      return (await axios(RequestConfig)).data.pypx;
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  async queryByPatientID(PatientID: string, filters: PFDCMFilters = {}) {
    return this.query({ PatientID }, filters);
  }

  async queryByPatientName(PatientName: string, filters: PFDCMFilters = {}) {
    return this.query({ PatientName }, filters);
  }

  async queryByStudyDate(date: Date, filters: PFDCMFilters = {}) {
    // date string format: yyyyMMddd (no spaces or dashes)
    const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
    return this.query({ StudyDate: dateString }, filters);
  }
}

export default PFDCMClient;

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
