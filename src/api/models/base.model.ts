import axios, { AxiosRequestConfig } from "axios";
// import { Request, Collection } from "@fnndsc/chrisapi";
// Chris API base id type
export type chrisId = number | string;

// Base Chris API objects
export interface ICollection {
  version: string;
  href: string;
  items: IItem[];
  links: ILink[];
  queries?: IItem[];
}

export interface IItem {
  data: IDatum[];
  href: string;
  links: ILink[];
}

export interface IDatum {
  name: string;
  value: chrisId;
}

export interface ILink {
  rel: IRel;
  href: string;
}

export enum IRel {
  Descendants = "descendants",
  Feed = "feed",
  Files = "files",
  Parameters = "parameters",
  Plugin = "plugin",
  Previous = "previous"
}

export interface ICollectionLinks {
  feed: string;
}

export interface ITemplate {
  data: IDatum[];
}

export interface IActionTypeParam {
  type: string;
  payload?: any;
  meta?: any;
  error?: any;
}

// CHRIS API REQUEST (working)
export default class ChrisModel {
  static fetchRequest(url: string) {
    const auth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
    const header = {
      "Content-Type": "application/vnd.collection+json",
      "Authorization": "Token " + auth.token
    };

    const config: AxiosRequestConfig = {
      headers: header,
      method: "get",
      url
    };
    return axios(config);
  }

  // Fetch file blob from server
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

  // Fetch file Arraybuffer from server
  static getFileBufferArrayArray(url: string) {
    const auth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
    const header = {
      "Content-Type": "application/vnd.collection+json",
      "Authorization": "Token " + auth.token
    };
    const config: AxiosRequestConfig = {
      headers: header,
      method: "get",
      responseType: "arraybuffer",
      url
    };
    return axios(config);
  }

  // NOTE: This returns an IItem object needs to be parsed into client models ***** TBD
  // Will be integrated for v2
  // static fetchChrisRequest(url: string) {
  //   const auth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
  //   const req = new Request(auth, "application/vnd.collection+json");
  //   return req.get(url).then((res) => {
  //     return parseCollectiontoModel(res.data); // Need a parser form ICollection to IFeed and others
  //   }) .catch((error) => {
  //     return error;
  //   })
  // }
}
