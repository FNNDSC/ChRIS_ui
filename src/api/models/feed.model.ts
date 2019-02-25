import axios, { AxiosRequestConfig } from "axios";
import Client, { Feed, FeedList, PluginInstance } from "@fnndsc/chrisapi";

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

  // Description: Get Plugin instance using API - will be moved to a different class
  static getPluginInstanceAPI(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances/`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const feedlist = new FeedList(url, auth);
    return feedlist.get();
  }
  // Description: get list of plugin instances after getting feed information
  // ***** working call ***** will be converted to @fnndsc/chrisapi need login and token first
  static getPluginInstance(url: string) {
   // const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
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
    return axios(config); // config: AxiosRequestConfig
  }

  // ------------------------------------------------------------------------
  // Using ChrisAPI - NOTE: Pending API adjustments and TS definition
  // ------------------------------------------------------------------------
  // Description: gets all feeds - using API
  static getFeeds() {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const client = new Client(url, auth);
    const params = { limit: 10, offset: 0 };
    return client.getFeeds(params);
  }

}
