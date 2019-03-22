import axios, { AxiosRequestConfig } from "axios";
import Client, { FeedList, IParams, IAuth } from "@fnndsc/chrisapi";
import { ITemplate, chrisId } from "./base.model";
// These will come from ClienAPI ts definition when completed
// NOTE: ***** working typings *****
// ------------------------------------------
export interface IFeedItem extends IFeedLinks {
  id: chrisId;
  creation_date: string;
  modification_date: string;
  name: string;
  creator_username: string;
  template?: ITemplate;
}

// Description: urls for IFeed
export interface IFeedLinks {
  url: string;
  files: string;
  comments: string;
  owner: string[];
  note: string;
  tags: string;
  taggings: string;
  plugin_instances: string;
}

// Set up defaults
const defaultParams: IParams = { limit: 10, offset: 0 };
const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
export default class FeedModel {
  // Description: gets Feed information
  static getFeed(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
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

  // Use this one when using url in the data object
  // Description: Fetch request - pass the url and gets the data from BE
  // ***** used in plugin instances list, Plugin descendants, more...
  // Param: url passed in with the response
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
     return axios(config); // config: AxiosRequestConfig
   }

  // ------------------------------------------------------------------------
  // Using ChrisAPI - NOTE: Pending API adjustments and TS definition
  // ------------------------------------------------------------------------
  // Description: gets all feeds - using API
  static getFeeds() {
    const auth: IAuth = { token: `${window.sessionStorage.getItem("AUTH_TOKEN")}` };
    const client = new Client(url, auth);
    return client.getFeeds(defaultParams);
  }

  // Description: Get Plugin instance using API - will be moved to a different class
  // static getPluginInstanceAPI(id: string) {
  //   const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances/`;
  //   const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") || ""};
  //   const feedlist = new FeedList(url, auth);
  //   return feedlist.getItems();
  // }

}
