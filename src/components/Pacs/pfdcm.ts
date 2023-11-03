import axios, { AxiosRequestConfig } from "axios";
import { PFDCMFilters, PACSPatient, PACSPullStages } from "./types";
import { parseRawDcmData, sortStudiesByPatient } from "./utils";

export class PFDCMClient {
  private readonly url: string;
  private readonly cube: string;
  private readonly swift: string;
  private pacsService = {
    value: "",
  };
  private pacsServiceList: string[] = [];
  private withFeedBack = false;

  private headers = {
    accept: "application/json",
    contentType: "application/json",
  };

  constructor() {
    if (!import.meta.env.VITE_PFDCM_URL) {
      throw Error("PFDCM URL is undefined.");
    }
    this.url = import.meta.env.VITE_PFDCM_URL as string;
    this.cube = import.meta.env.VITE_PFDCM_CUBEKEY as string;
    this.swift = import.meta.env.VITE_PFDCM_SWIFTKEY as string;

    const service = localStorage.getItem("PFDCM_SET_SERVICE");
    if (service) {
      this.pacsService = {
        value: service,
      };
    }
  }

  set service(key: string) {
    if (!this.pacsServiceList.includes(key))
      throw Error(`'${key}' is not a registered PACS service.`);

    localStorage.setItem("PFDCM_SET_SERVICE", key);
    this.pacsService = {
      value: key,
    };
  }

  get service() {
    return this.pacsService.value;
  }

  async getPacsServices(): Promise<string[]> {
    try {
      const list = await axios.get(`${this.url}api/v1/PACSservice/list/`);
      this.pacsServiceList = list.data;
      return list.data;
    } catch (error) {
      return [];
    }
  }

  async status(query: PFDCMFilters) {
    const pullstatus = new PFDCMPull(query);

    if (!this.service) {
      throw new Error("The PACS Service was not set");
    }

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "status",
        },
      },
    };

    try {
      const data = (await axios(RequestConfig)).data;
      if (!data.status) return pullstatus;

      const { then } = data.pypx;

      const studies: any[] = then["00-status"].study;

      const images = { requested: 0, packed: 0, pushed: 0, registered: 0 };
      const imagestatus = {
        requested: false,
        packed: false,
        pushed: false,
        registered: false,
      };

      for (const study of studies) {
        for (const key in study) {
          if (Object.prototype.hasOwnProperty.call(study, key)) {
            const serieslist: any[] = study[key];

            console.log("SeriesList", serieslist);

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
          }
        }
      }

      if (images.requested !== 0) {
        pullstatus.attempts = DEFAULT_STAGE_ATTEMPTS_MUL(images.requested);
      }

      if (imagestatus.requested) {
        if (imagestatus.packed) {
          pullstatus.progress = images.packed / images.requested;
          pullstatus.progressText = `${images.packed} of ${images.requested}`;
          pullstatus.stage = PACSPullStages.RETRIEVE;
          pullstatus.stageText = __stageText(PACSPullStages.RETRIEVE);

          if (images.pushed) {
            pullstatus.progress = images.pushed / images.requested;
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
                pullstatus.progress = images.registered / images.requested;
                pullstatus.progressText = `${images.registered} of ${images.requested}`;
                pullstatus.stage = PACSPullStages.REGISTER;
                pullstatus.stageText = __stageText(PACSPullStages.REGISTER);
              }
            }
          }
        }
      }

      return pullstatus;
    } catch (error) {
      console.log("Error", error);
    }
  }

  async pull(query: PFDCMFilters = {}) {
    if (!this.service) throw Error("Set the PACS service first.");

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
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
              swiftPackEachDICOM: true,
            }),
            JSON.stringify({
              db: "/home/dicom/log",
              CUBE: this.cube,
              swiftServicesPACS: this.service,
              parseAllFilesWithSubStr: "dcm",
            }),
          ].join(","),
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findRetrieve(query: PFDCMFilters = {}) {
    if (!this.service) throw Error("Set the PACS service first.");

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          withFeedBack: this.withFeedBack,
          then: "retrieve",
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findPush(query: PFDCMFilters = {}) {
    if (!this.service) throw Error("Set the PACS service first.");

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "push",
          withFeedBack: this.withFeedBack,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log",
            swift: this.swift,
            swiftServicesPACS: this.service,
            swiftPackEachDICOM: true,
          }),
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  async findRegister(query: PFDCMFilters = {}) {
    if (!this.service) throw Error("Set the PACS service first.");

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "register",
          withFeedBack: this.withFeedBack,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log",
            CUBE: this.cube,
            swiftServicesPACS: this.service,
            parseAllFilesWithSubStr: "dcm",
          }),
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error) {
      console.error(error);
    }
  }

  private async __find(query: PFDCMFilters = {}) {
    if (!this.service)
      throw Error("Set the PACS service first, before querying.");

    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: this.headers,
      data: {
        PACSservice: this.pacsService,
        listenerService: { value: "default" },
        PACSdirective: query,
      },
    };

    try {
      const response = (await axios(RequestConfig)).data;
      const { pypx, status, message } = response;
      if (status) return pypx;
      else throw message;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async find(query: PFDCMFilters = {}) {
    const raw = await this.__find(query);
    if (raw) {
      const studies = parseRawDcmData(raw);
      return sortStudiesByPatient(studies);
    } else return [] as PACSPatient[];
  }
}

const DEFAULT_STAGE_ATTEMPTS = 10;
const DEFAULT_STAGE_ATTEMPTS_MUL = (files: number) => 2 * files;

const __stageText = (stage: PACSPullStages) => {
  switch (stage) {
    case PACSPullStages.NONE:
      return "Requesting";
    case PACSPullStages.RETRIEVE:
      return "Retrieving";
    case PACSPullStages.PUSH:
      return "Pushing";
    case PACSPullStages.REGISTER:
      return "Registering";
    case PACSPullStages.COMPLETED:
      return "Completed";
  }
};

export class PFDCMPull {
  query: PFDCMFilters;
  stage: PACSPullStages;
  stageText: string;
  progress: number;
  progressText: string;
  attempts: number;
  errors: string[];

  constructor(
    query: PFDCMFilters = {},
    stage: PACSPullStages = PACSPullStages.NONE
  ) {
    this.query = query;
    this.stage = stage;
    this.stageText = __stageText(stage);
    this.progress = stage === PACSPullStages.NONE ? 1 : 0;
    this.progressText = " ";
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
    if (this.stage === PACSPullStages.COMPLETED) return this.stage;
    return (this.stage + 1) as PACSPullStages;
  }
}
