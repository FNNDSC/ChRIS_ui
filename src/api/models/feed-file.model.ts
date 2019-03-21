import axios, { AxiosRequestConfig } from "axios";
import { chrisId } from "./base.model";

// Description: ChRIS API Feed File
// ------------------------------------------
export interface IFeedFile extends IFeedFileLinks {
  id: chrisId;
  feed_id: chrisId;
  plugin_inst_id: chrisId;
  fname: string;
}

// Description: urls for IFeedFile
export interface IFeedFileLinks {
  url: string;
  file_resource: string;
  plugin_instances: string;
}

// Set up defaults
// const defaultParams: IParams = { limit: 10, offset: 0 };

// Fetch file blob from server
export default class FeedFileModel {
  static getFileBlob(url: string) {
    const auth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
    const header = {
      "Content-Type": "application/vnd.collection+json",
      "Authorization": "Token " + auth.token
    };
    const config: AxiosRequestConfig = {
      headers: header,
      method: "get",
      responseType: "blob",
      url
    };
    return axios(config);
  }
}
