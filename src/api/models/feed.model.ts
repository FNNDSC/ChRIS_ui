import axios, { AxiosRequestConfig } from "axios";
import Client, { Feed, FeedList, PluginInstance } from "@fnndsc/chrisapi";

export default class FeedModel {
  // Description: gets all feeds
  static getFeeds() {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const client = new Client(url, auth);
    const params = { limit: 10, offset: 0 };
    return client.getFeeds(params);
  }

  // Description: gets Feed information
  static getFeed(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const header = {
      "Content-Type": "application/vnd.collection+json",
      "Authorization": "Token " + auth.token
    };

    const config: AxiosRequestConfig = {
      headers: header,
      method: "get",
      url: url + id // TEMP  ***** working *****
    };
    return axios(config);
    // const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/`;
    // const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    // const feed = new Feed(url, auth);
    // return feed.get();
    // const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances/`;
    // const auth = { token: window.sessionStorage.getItem('AUTH_TOKEN') };
    // const feedlist = new FeedList(url, auth);
    // return feedlist.get();
  }
  // Description: Get Plugin instance using API - will be moved to a different class
  static getPluginInstanceAPI(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}${id}/plugininstances/`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const feedlist = new FeedList(url, auth);
    return feedlist.get();
  }
  // Description: get list of plugin instances ***** working call ***** will be converted to @fnndsc/chrisapi need login and token first
  static getPluginInstance(id: string) {
    const url = `${process.env.REACT_APP_CHRIS_UI_URL}`;
    const auth = { token: window.sessionStorage.getItem("AUTH_TOKEN") };
    const header = {
      "Content-Type": "application/vnd.collection+json",
      "Authorization": "Token " + auth.token
    };

    const config: AxiosRequestConfig = {
      headers: header,
      method: "get",
      url: url + id + "/plugininstances/" // TEMP  ***** working *****
    };

    // Local result set call from a local json file
    // const config: AxiosRequestConfig = {
    //     method: 'get',
    //     url: "/mockData/plugininstances2.json", //TEMP  ***** working *****
    // }

    return axios(config); // config: AxiosRequestConfig
  }
}
