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
  async find(query: PFDCMFilters = {}) {
    while (this.isLoadingPACSserviceList) {}
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first, before querying.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        pypx_find: {
          ...query,
          then: "status"
        }
      }
    }

    try {
      return (await axios(RequestConfig)).data.pypx
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  async findRetrieve(query: PFDCMFilters = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
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

  async findPushSwift(query: PFDCMFilters = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
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

  async findRegisterCube(query: PFDCMFilters = {}) {
    if (!this.PACSservice.value)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
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
    const raw = await this.find({ PatientID, ...filters });
    if (raw) {
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } 
    else 
      return [];
  }

  async queryByPatientName(PatientName: string, filters: PFDCMFilters = {}) {
    const raw = await this.find({ PatientName, ...filters });
    if (raw) {
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } 
    else 
      return [];
  }

  async queryByStudyDate(date: Date, filters: PFDCMFilters = {}) {
    // date string format: yyyyMMddd (no spaces or dashes)
    const dateString = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
    const raw = await this.find({ StudyDate: dateString, ...filters });
    if (raw) {
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } 
    else 
      return [];
  }
}

export default PFDCMClient;

type PatientSex = 'M' | 'F' | 'O';
type QueryRetrieveLevel = 'STUDY' | 'SERIES' | 'IMG';

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

export interface PFDCMFilters {
  AccessionNumber?: string;
  Modality?: string;
  PatientBirthDate?: Date;
  PatientID?: string;
  PatientName?: string;
  PatientSex?: PatientSex;
  RetrieveAETitle?: string;
  // SeriesDescription?: string;
  SeriesInstanceUID?: string;
  StudyDate?: string;
  StudyInstanceUID?: string;
}
