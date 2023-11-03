import axios from "axios";
import type { AxiosRequestConfig } from "axios";

class PfdcmClient {
  private readonly url: string;
  private readonly cube: string;
  private readonly swift: string;

  constructor() {
    this.url = import.meta.env.VITE_PFDCM_URL;
    this.cube = import.meta.env.VITE_PFDCM_CUBEKEY;
    this.swift = import.meta.env.VITE_PFDCM_SWIFTKEY;
  }

  async getPacsServices() {
    try {
      const url = `${this.url}api/v1/PACSservice/list/`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.log("Error", error);
    }
  }

  async status(query: any, selectedPacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: {
        PACSservice: {
          value: selectedPacsService,
        },
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "status",
        },
      },
    };

    try {
      const response = (await axios(RequestConfig)).data;

      const imagestatus = {
        request: false,
        pack: false,
        push: false,
        register: false,
      };

      const currentStatus = {
        currentStep: "",
        progressText: "",
        currentProgress: 0,
      };

      if (!response.status)
        return {
          imagestatus,
          currentStatus,
        };

      const { then } = response.pypx;

      const studies = then["00-status"].study;

      const images = { requested: 0, packed: 0, pushed: 0, registered: 0 };

      for (const study of studies) {
        for (const key in study) {
          const seriesList = study[key];
          for (const series of seriesList) {
            if (series.images.requested.count === -1) {
              images.requested = 0;
              imagestatus.request = false;
              break;
            }
            images.requested += series.images.requested.count;
            imagestatus.request = series.images.requested.status;

            if (series.images.packed.count === -1) break;
            images.packed += series.images.packed.count;
            imagestatus.pack = series.images.packed.status;

            if (series.images.pushed.count === -1) break;
            images.pushed += series.images.pushed.count;
            imagestatus.push = series.images.pushed.status;

            if (series.images.registered.count === -1) break;
            images.registered += series.images.registered.count;
            imagestatus.register = series.images.registered.status;
          }
        }
      }

      if (!imagestatus.request) {
        currentStatus.currentStep = "none";
        currentStatus.progressText = "";
        currentStatus.currentProgress = 0;
      }

      if (imagestatus.request) {
        if (imagestatus.pack) {
          currentStatus.currentProgress = images.packed / images.requested;
          currentStatus.currentStep = "retrieve";
          currentStatus.progressText = `${images.packed} of ${images.requested}`;
        }

        if (imagestatus.push) {
          currentStatus.currentProgress = images.pushed / images.requested;
          currentStatus.currentStep = "push";
          currentStatus.progressText = `${images.pushed} of ${images.requested}`;
        }
        if (imagestatus.register) {
          if (images.registered === images.requested) {
            currentStatus.currentProgress = 1;
            currentStatus.currentStep = "completed";
            currentStatus.progressText = "Files are available for this series";
          } else {
            currentStatus.currentProgress =
              images.registered / images.requested;
            currentStatus.currentStep = "register";
            currentStatus.progressText = `${images.registered} of ${images.requested}`;
          }
        }
      }

      return {
        imagestatus,
        currentStatus,
      };
    } catch (error) {
      console.log("Error while fetching status", error);
    }
  }

  async find(query: any, selectedPacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/sync/pypx/`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        PACSservice: { value: selectedPacsService },
        listenerService: { value: "default" },
        PACSdirective: query,
      },
    };

    try {
      const response = (await axios(RequestConfig)).data;
      const { pypx, status } = response;
      if (status) {
        return pypx;
      }
    } catch (error) {
      console.log("Error", error);
    }
  }

  async findRetrieve(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        PACSservice: {
          value: pacsService,
        },
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          withFeedBack: true,
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

  async findPush(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        PACSservice: {
          value: pacsService,
        },
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "push",
          withFeedBack: true,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log",
            swift: this.swift,
            swiftServicesPACS: {
              value: pacsService,
            },
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

  async findRegister(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        PACSservice: {
          value: pacsService,
        },
        listenerService: { value: "default" },
        PACSdirective: {
          ...query,
          then: "register",
          withFeedBack: true,
          thenArgs: JSON.stringify({
            db: "/home/dicom/log",
            CUBE: this.cube,
            swiftServicesPACS: {
              value: pacsService,
            },
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
}
export default PfdcmClient;
