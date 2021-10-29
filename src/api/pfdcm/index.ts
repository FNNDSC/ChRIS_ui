import { parseRawDcmData, sortStudiesByPatient } from "./pfdcm-utils";
import axios, { AxiosRequestConfig } from "axios";
import { getWithExpiry, setWithExpiry } from "../../utils";

interface PFDCMClientOptions {
  setDefaultPACS: boolean
}

const PFDCMDefaultOptions: PFDCMClientOptions = { 
  setDefaultPACS: true 
}

const __stageText = (stage:PACSPullStages) => {
  switch (stage) {
    case PACSPullStages.NONE:      return "Requesting";
    case PACSPullStages.RETRIEVE:  return "Retrieving";
    case PACSPullStages.PUSH:      return "Pushing";
    case PACSPullStages.REGISTER:  return "Registering";
    case PACSPullStages.COMPLETED: return "Completed";
  }
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

  private withFeedBack = false;

  constructor({ }: PFDCMClientOptions = PFDCMDefaultOptions) {
    if (!process.env.REACT_APP_PFDCM_URL)
      throw Error('PFDCM URL is undefined.');

    this.url = process.env.REACT_APP_PFDCM_URL as string
    this.cube = process.env.REACT_APP_PFDCM_CUBEKEY as string
    this.swift = process.env.REACT_APP_PFDCM_SWIFTKEY as string
    
    this.withFeedBack = process.env.NODE_ENV !== "production";

    const _service = getWithExpiry("PFDCM_SET_SERVICE");
    if (_service)
      this.PACSservice = {
        value: _service
      }
  }

  /**
   * Get the registered PACS service to use for pfdcm.
   */
  get service() {
    return this.PACSservice.value
  }

  /**
   * Set a registered PACS service key to use for pfdcm.
   */
  set service(key: string) {
    if (!this.PACSserviceList.includes(key))
      throw Error(`'${key}' is not a registered PACS service.`)
      setWithExpiry("PFDCM_SET_SERVICE", key, 43200 * 60 * 1000);
    this.PACSservice = {
      value: key
    }
  }

  /**
   * Get list of registered PACS services.
   */
   get serviceList() {
    while (this.isLoadingPACSserviceList) {}
    return this.PACSserviceList
  }

  /**
   * Get a list of registered PACS services from pfdcm.
   * @returns PACSservice key list
   */
  async getPACSservices(): Promise<string[]> {
    this.isLoadingPACSserviceList = true;
    try {
      const list = await axios.get(`${this.url}api/v1/PACSservice/list/`)
      this.PACSserviceList = list.data;
      this.isLoadingPACSserviceList = false;
      return list.data;
    } catch (error) {
      console.error(error)
      this.isLoadingPACSserviceList = false;
      return [];
    }
  }

  /**
   * Get properties of a registered PACS service from pfdcm.
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
   * Send request to the `/pypx` endpoint, used for query and retrieve.
   * @param query Query Object
   * @param filters Filters on the Query Obeject
   * @returns PACS Patient array
   */
  private async __find(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error('Set the PACS service first, before querying.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: query
      }
    }

    try {
      const { pypx, status, message } = (await axios(RequestConfig)).data;
      if (status)
        return pypx;
      else
        throw message;
    } catch (error) {
      console.error(error);
      return null; 
    }
  }

  /**
   * Find status of a running pull from PFDCM.
   * @param query PFDCM Query to find studies
   * @returns PFDCM Pull status
   */
  async status(query: PFDCMFilters = {}): Promise<PFDCMPull> {
    const pullstatus = new PFDCMPull(query);

    if (!this.service)
      throw Error('Set the PACS service first, before querying.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "status"
        }
      }
    }

    try {
      const status = (await axios(RequestConfig)).data;
      if (!status.status) return pullstatus;

      const { then } = status.pypx;
      const studies: any[] = then["00-status"].study;

      const images =      { requested: 0,     packed: 0,     pushed: 0,     registered: 0 }
      const imagestatus = { requested: false, packed: false, pushed: false, registered: false }

      for (const study of studies) {
        for (const key in study) {
        if (Object.prototype.hasOwnProperty.call(study, key)) {
          const serieslist: any[] = study[key];

          for (const series of serieslist) {
            if (series.images.requested.count === -1) {
              images.requested = 0;
              imagestatus.requested = false;
              break;
            }

            images.requested += series.images.requested.count;
            imagestatus.requested = series.images.requested.status;
            
            if (series.images.packed.count === -1) break;
            images.packed += series.images.packed.count;
            imagestatus.packed = series.images.packed.status;
            
            if (series.images.pushed.count === -1) break;
            images.pushed += series.images.pushed.count;
            imagestatus.pushed = series.images.pushed.status;
            
            if (series.images.registered.count === -1) break;
            images.registered += series.images.registered.count;
            imagestatus.registered = series.images.registered.status;
          }
        }}
      }

      if (images.requested !== 0)
        pullstatus.attempts = DEFAULT_STAGE_ATTEMPTS_MUL(images.requested);

      if (imagestatus.requested) {
        if (imagestatus.packed) {
          pullstatus.progress = images.packed/images.requested;
          pullstatus.progressText = `${images.packed} of ${images.requested}`;
          pullstatus.stage = PACSPullStages.RETRIEVE;
          pullstatus.stageText = __stageText(PACSPullStages.RETRIEVE);
          
          if (images.pushed) {
            pullstatus.progress = images.pushed/images.requested;
            pullstatus.progressText = `${images.pushed} of ${images.requested}`;
            pullstatus.stage = PACSPullStages.PUSH;
            pullstatus.stageText = __stageText(PACSPullStages.PUSH);
            
            if (images.registered) {
              if (images.registered === images.requested) {
                pullstatus.progress = 1;
                pullstatus.progressText = `Files will shortly be available in ChRIS`;
                pullstatus.stage = PACSPullStages.COMPLETED;
                pullstatus.stageText = __stageText(PACSPullStages.COMPLETED);
              } else {
                pullstatus.progress = images.registered/images.requested;
                pullstatus.progressText = `${images.registered} of ${images.requested}`;
                pullstatus.stage = PACSPullStages.REGISTER;
                pullstatus.stageText = __stageText(PACSPullStages.REGISTER);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      return pullstatus; 
    }
  }

  async pull(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "retrieve,push,register",
          thenArgs: [
            JSON.stringify({}),
            JSON.stringify({
              db: "/home/dicom/log", 
              swift: this.swift, 
              swiftServicesPACS: this.service,
              swiftPackEachDICOM: true
            }),
            JSON.stringify({
              db: "/home/dicom/log", 
              CUBE: this.cube,
              swiftServicesPACS: this.service,
              parseAllFilesWithSubStr: "dcm"
            })
          ].join(",")
        }
      }
    }

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findRetrieve(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          withFeedBack: this.withFeedBack,
          then: "retrieve"
        }
      }
    }

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findPush(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "push",
          withFeedBack: this.withFeedBack,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log", 
            swift: this.swift, 
            swiftServicesPACS: this.service,
            swiftPackEachDICOM: true
          })
        }
      }
    }

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findRegister(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error('Set the PACS service first.');

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.PACSservice,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,           
          then: "register",
          withFeedBack: this.withFeedBack,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log", 
            CUBE: this.cube,
            swiftServicesPACS: this.service,
            parseAllFilesWithSubStr: "dcm"
          })
        }
      }
    }

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async find(query: PFDCMFilters = {}) {
    const raw = await this.__find(query);
    if (raw) {
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } 
    else 
      return [] as PACSPatient[];
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

export enum PACSPullStages {
  NONE, RETRIEVE, PUSH, REGISTER, COMPLETED
}

const DEFAULT_STAGE_ATTEMPTS = 10;
const DEFAULT_STAGE_ATTEMPTS_MUL = (files: number) => 2 * files;

export class PFDCMPull {
  query: PFDCMFilters
  stage: PACSPullStages
  stageText: string
  progress: number
  progressText: string
  attempts: number
  errors: string[]

  constructor(query: PFDCMFilters = {}, stage: PACSPullStages = PACSPullStages.NONE) {
    this.query = query;
    this.stage = stage;
    this.stageText = __stageText(stage);
    this.progress = stage === PACSPullStages.NONE ? 1 : 0;
    this.progressText = " "
    this.attempts = DEFAULT_STAGE_ATTEMPTS;
    this.errors = [];
  }

  equals(pull: PFDCMPull): boolean {
    if (
      pull.query == this.query &&
      pull.stage === this.stage &&
      pull.progress === this.progress
    )
      return true;

    return false;
  }

  get isStageCompleted() {
    return this.progress === 1;
  }

  get isPullCompleted() {
    return this.stage === PACSPullStages.COMPLETED;
  }

  get isStarted() {
    return this.stage !== PACSPullStages.NONE;
  }

  get isRunning() {
    return (
      this.stage !== PACSPullStages.COMPLETED &&
      this.stage !== PACSPullStages.NONE
    );
  }

  get nextStage() {
    if (this.stage === PACSPullStages.COMPLETED)
      return this.stage;
    return (this.stage + 1) as PACSPullStages;
  }
}
