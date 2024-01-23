import React from 'react';
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { Spin } from "antd";

export interface ImageStatusType {
  title: string;
  description: string;
  status: string;
  icon?: React.ReactNode;
}

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
    } catch (error: any) {
      throw new Error(error);
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
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findRetrieve(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        Accept: "application/json",
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
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findPush(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        Accept: "application/json",
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
            swiftServicesPACS: pacsService,
            swiftPackEachDICOM: true,
          }),
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async findRegister(query = {}, pacsService: string) {
    const RequestConfig: AxiosRequestConfig = {
      url: `${this.url}api/v1/PACS/thread/pypx/`,
      method: "POST",
      headers: {
        Accept: "application/json",
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
            swiftServicesPACS: pacsService,
            parseAllFilesWithSubStr: "dcm",
          }),
        },
      },
    };

    try {
      await axios(RequestConfig);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async stepperStatus(
    query: any,
    selectedPacsService: string,
    seriesInstanceUID: string,
    requestedFiles?: number,
    retrieve?: boolean,
  ) {
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
          json_response: true,
        },
      },
    };

    try {
      const response = (await axios(RequestConfig)).data;
      const { then } = response.pypx;
      const studies = then["00-status"].study;

      const stepperStatus = this.calculateStatus(
        studies,
        seriesInstanceUID,
        requestedFiles,
        retrieve,
      );

      return stepperStatus;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  calculateStatus(
    studies: any[],
    seriesInstanceUID: string,
    requestedFiles?: number,
    retrieve?: boolean,
  ) {
    const statusMap = new Map<
      string,
      {
        newImageStatus: ImageStatusType[];
        progress: {
          currentStep: string;
          currentProgress: number;
        };
      }
    >();
    const progressMap = new Map<string, { imagestatus: any; images: any }>();

    for (const study of studies) {
      for (const key in study) {
        const seriesList = study[key];

        for (const [_, series] of seriesList.entries()) {
          const images = { requested: 0, packed: 0, pushed: 0, registered: 0 };
          const imagestatus = {
            request: false,
            pack: false,
            push: false,
            register: false,
          };

          if (series.images.requested.count === -1) {
            images.requested = 0;
            imagestatus.request = false;
            progressMap.set(seriesInstanceUID, { imagestatus, images });
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

          progressMap.set(seriesInstanceUID, { imagestatus, images });
        }
      }
    }

    for (const [_, seriesData] of progressMap.entries()) {
      let currentStep = "none";
      let currentProgress = 0;
      const newImageStatus: ImageStatusType[] = [
        { title: "Request", description: "", status: "wait" },
        { title: "Retrieve", description: "", status: "wait" },
        { title: "Push", description: "", status: "wait" },
        { title: "Register", description: "", status: "wait" },
      ];

      const { imagestatus, images } = seriesData;

      if (!imagestatus.request && retrieve) {
        newImageStatus[0].icon = <Spin />;
        newImageStatus[0].description = requestedFiles
          ? `Requesting ${requestedFiles} files`
          : `Requesting files`;
      }

      if (imagestatus.request) {
        currentStep = "request";
        newImageStatus[0].description = `${images.requested} of ${
          requestedFiles ? requestedFiles : images.requested
        }`;
        newImageStatus[0].status = "finish";
      }

      if (imagestatus.pack) {
        currentStep = "retrieve";
        newImageStatus[1].description = `${images.packed} of ${images.requested}`;
        newImageStatus[1].status =
          images.packed < images.requested
            ? "process"
            : images.packed === images.requested
              ? "finish"
              : "wait";
        currentProgress = images.packed / images.requested;
        newImageStatus[1].icon = newImageStatus[1].status === "process" && (
          <Spin />
        );
      }

      if (imagestatus.push) {
        currentStep = "push";
        newImageStatus[2].description = `${images.pushed} of ${images.requested}`;
        newImageStatus[2].status =
          images.pushed < images.requested
            ? "process"
            : images.pushed === images.requested
              ? "finish"
              : "wait";
        currentProgress = images.pushed / images.requested;
        newImageStatus[2].icon = imagestatus.pack &&
          !imagestatus.push &&
          !imagestatus.register && <Spin />;
      }

      if (imagestatus.register) {
        if (images.registered === images.requested) {
          currentStep = "completed";
          newImageStatus[3].description = `${images.registered} of ${images.requested}`;
          newImageStatus[3].status = "finish";
          currentProgress = 1;
        } else {
          currentStep = "register";
          newImageStatus[3].description = `${images.registered} of ${images.requested}`;
          newImageStatus[3].status = "process";
          currentProgress = images.registered / images.requested;
          newImageStatus[3].icon = newImageStatus[3].status === "process" && (
            <Spin />
          );
        }
      }

      statusMap.set(seriesInstanceUID, {
        newImageStatus: newImageStatus,
        progress: {
          currentStep,
          currentProgress,
        },
      });
    }

    return statusMap;
  }
}
export default PfdcmClient;
