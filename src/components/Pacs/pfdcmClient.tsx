import React from "react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { Spin } from "antd";

export interface ImageStatusType {
  title: string;
  description: string;
  status: string;
  icon?: React.ReactNode;
}

export interface DataFetchQuery {
  SeriesInstanceUID: string;
  StudyInstanceUID: string;
}

class PfdcmClient {
  private readonly url: string;

  constructor() {
    this.url = import.meta.env.VITE_PFDCM_URL || "";
  }

  async getPacsServices() {
    try {
      if (!this.url) {
        throw new Error(
          "Failed to find a PFDCM Service. Please use the Pacs Query Retrieve at this link: http://chris-next.tch.harvard.edu:2222",
        );
      }

      const url = `${this.url}api/v1/PACSservice/list/`;
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      throw error;
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

  async findRetrieve(pacsService: string, query: DataFetchQuery) {
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
      const response = await axios(RequestConfig);
      return response.data.timestamp;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
export default PfdcmClient;
